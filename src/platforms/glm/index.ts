/* eslint-disable @typescript-eslint/no-explicit-any -- 与外部 GLM 监控 API 交互的原始 JSON 无类型定义 */
/**
 * GLM Coding Plan（智谱 / Z.ai）平台适配器。
 *
 * 这是该插件最初的、也是目前唯一接入真实 API 的参考实现：
 *  - 套餐档位：Lite / Pro / Max（源自原 constants.ts 的 PLAN_QUOTAS）。
 *  - 监控端点：/api/monitor/usage/{model-usage, tool-usage, quota/limit}。
 *  - 认证：直接以 API Key 作为 Authorization 头（与官方一致）。
 *
 * 其它平台可参照本文件实现自己的 queryUsage，只要把原生配额类型归一化到
 * QUOTA_TYPE_5H / QUOTA_TYPE_WEEKLY / QUOTA_TYPE_MCP 即可复用全部下游管线。
 */
import { URL } from 'url';
import { UsageResponse, ModelUsageData, ToolUsageData, QuotaLimitData, TrendData, ActiveDaysInfo } from '../../types';
import { QUOTA_TYPE_5H, QUOTA_TYPE_WEEKLY, QUOTA_TYPE_MCP } from '../../constants';
import { PlatformAdapter, PlatformPlan, CostEstimate, UsageQueryConfig } from '../types';
import { httpsGetWithRetry } from '../httpClient';
import { estimateGlmCost } from './pricing';

// ===== 套餐档位（迁自 constants.ts） =====

/**
 * Pro 5h 基础值: 59,304,317 tokens / 527 calls
 * 周配额 = 5h配额 × 5；Lite = Pro ÷ 5，Max = Pro × 4。
 * （Lite 5h 基于 Pro ÷ 5 向下取整）
 */
const GLM_PLAN_QUOTAS: Record<string, PlatformPlan['quota']> = {
    Lite: { tokens5h: 11_860_863, calls5h: 105, tokensWeekly: 59_304_317, callsWeekly: 527 },
    Pro: { tokens5h: 59_304_317, calls5h: 527, tokensWeekly: 296_521_585, callsWeekly: 2_635 },
    Max: { tokens5h: 237_217_268, calls5h: 2_108, tokensWeekly: 1_186_086_340, callsWeekly: 10_540 },
};

const plans: PlatformPlan[] = [
    { level: 'Lite', displayName: 'Lite', quota: GLM_PLAN_QUOTAS.Lite },
    { level: 'Pro', displayName: 'Pro', quota: GLM_PLAN_QUOTAS.Pro },
    { level: 'Max', displayName: 'Max', quota: GLM_PLAN_QUOTAS.Max },
];

const descriptor = {
    id: 'glm',
    displayName: 'GLM Coding Plan Usage',
    shortLabel: 'GLM',
    description: '智谱 GLM Coding Plan（open.bigmodel.cn / api.z.ai）',
    baseUrls: ['api.z.ai', 'open.bigmodel.cn', 'dev.bigmodel.cn'],
    defaultBaseUrl: 'https://open.bigmodel.cn/api/anthropic',
    docsUrl: 'https://open.bigmodel.cn',
    // 已知 GLM 模型 → 图表颜色（权威色表，从 htmlTemplate 下沉至此）
    modelColors: {
        'GLM-5.2': '#5985f5',
        'GLM-5.1': '#4ecdc4',
        'GLM-5-Turbo': '#f38441',
        'GLM-5V-Turbo': '#b86fe5',
        'GLM4.7': '#00c9a7',
        'GLM-4.6V': '#ff6b6b',
        'GLM-4.5-Air': '#ffd93d',
    },
};

// ===== 查询辅助（迁自 usageQuery.ts） =====

function formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getTimeWindow(): { startTime: string; endTime: string } {
    const now = new Date();
    return {
        startTime: formatDateTime(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0)),
        endTime: formatDateTime(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)),
    };
}

function get30DayTimeWindow(): { startTime: string; endTime: string } {
    const now = new Date();
    return {
        startTime: formatDateTime(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0)),
        endTime: formatDateTime(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)),
    };
}

function ensureArray<T>(data: any): T[] {
    if (Array.isArray(data)) { return data; }
    if (data && typeof data === 'object') { return Object.values(data) as T[]; }
    return [];
}

function processQuotaLimit(data: any): QuotaLimitData[] {
    if (!data || !data.limits) { return []; }

    let tokensLimitCount = 0;

    return data.limits.map((item: any) => {
        const base = { nextResetTime: item.nextResetTime };
        if (item.type === 'TOKENS_LIMIT') {
            const isFirst = tokensLimitCount === 0;
            tokensLimitCount++;
            return {
                ...base,
                type: isFirst ? QUOTA_TYPE_5H : QUOTA_TYPE_WEEKLY,
                percentage: item.percentage,
            };
        }
        if (item.type === 'TIME_LIMIT') {
            return {
                ...base,
                type: QUOTA_TYPE_MCP,
                percentage: item.percentage,
                currentUsage: item.currentValue,
                total: item.usage,
                remaining: item.remaining,
                usageDetails: item.usageDetails,
            };
        }
        return { ...base, type: item.type, percentage: item.percentage };
    });
}

function processTrendData(data: any): TrendData | undefined {
    if (!data || !data.x_time || !data.tokensUsage) { return undefined; }

    const modelDataList = (data.modelDataList || []).map((item: any) => ({
        model: item.modelName || '',
        xTime: data.x_time,
        yValue: item.tokensUsage || [],
        callCount: item.modelCallCount || item.callCount || [],
    }));

    return {
        xTime: data.x_time,
        yValue: data.tokensUsage,
        modelCallCount: data.modelCallCount || [],
        modelDataList: modelDataList.length > 0 ? modelDataList : undefined,
        totalUsage: data.totalUsage || { totalModelCallCount: 0, totalTokensUsage: 0 },
    };
}

function parseActiveDaysInfo(raw: any): ActiveDaysInfo | undefined {
    const xTime: string[] | undefined = raw?.x_time;
    const tokensUsage: (number | null)[] | undefined = raw?.tokensUsage;
    if (!xTime || !tokensUsage || xTime.length === 0) { return undefined; }

    const dayExists = new Set<string>();
    const dayActive = new Set<string>();

    for (let i = 0; i < xTime.length; i++) {
        const dateKey = xTime[i].split(' ')[0];
        dayExists.add(dateKey);
        const val = tokensUsage[i];
        if (val !== null && val !== undefined && val > 0) {
            dayActive.add(dateKey);
        }
    }

    return { activeDays: dayActive.size, totalDaysInWindow: dayExists.size };
}

// ===== 适配器 =====

export const glmAdapter: PlatformAdapter = {
    descriptor,
    plans,

    matchesBaseUrl(baseUrl: string): boolean {
        return descriptor.baseUrls.some((b) => baseUrl.includes(b));
    },

    validateConfig({ baseUrl }: UsageQueryConfig): { valid: boolean; error?: string } {
        if (!baseUrl) { return { valid: false }; }
        if (!this.matchesBaseUrl(baseUrl)) {
            return { valid: false };
        }
        return { valid: true };
    },

    getPlan(level: string): PlatformPlan | undefined {
        if (!level) { return undefined; }
        const lower = level.toLowerCase();
        return plans.find((p) => p.level.toLowerCase() === lower);
    },

    estimateCost(modelUsage: ModelUsageData[]): CostEstimate | null {
        if (!modelUsage || modelUsage.length === 0) { return null; }
        const est = estimateGlmCost(modelUsage);
        if (est.totalCny <= 0) { return null; }
        return {
            totalCny: est.totalCny,
            perModel: est.perModel,
            // modelUsage 来自 7 天时间窗口的查询
            windowLabel: 'Last 7 days',
            hasFallback: est.hasFallback,
        };
    },

    async queryUsage({ authToken, baseUrl }: UsageQueryConfig): Promise<UsageResponse> {
        const parsedBaseUrl = new URL(baseUrl);
        const baseDomain = `${parsedBaseUrl.protocol}//${parsedBaseUrl.host}`;

        const modelUsageUrl = `${baseDomain}/api/monitor/usage/model-usage`;
        const toolUsageUrl = `${baseDomain}/api/monitor/usage/tool-usage`;
        const quotaLimitUrl = `${baseDomain}/api/monitor/usage/quota/limit`;

        const { startTime, endTime } = getTimeWindow();
        const queryParams = `?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`;

        const { startTime: startTime30, endTime: endTime30 } = get30DayTimeWindow();
        const queryParams30 = `?startTime=${encodeURIComponent(startTime30)}&endTime=${encodeURIComponent(endTime30)}`;

        // 并发请求 4 个端点，任一失败不应丢弃其余数据：用 allSettled 容忍部分失败。
        // 配额接口（quota/limit）最关键 —— 失败时记录但仍返回其余统计，状态栏会显示 N/A。
        const [modelUsageRes, toolUsageRes, quotaLimitRes, modelUsage30Res] = await Promise.allSettled([
            httpsGetWithRetry<any>(modelUsageUrl, authToken, queryParams),
            httpsGetWithRetry<any>(toolUsageUrl, authToken, queryParams),
            httpsGetWithRetry<any>(quotaLimitUrl, authToken, undefined, (data) => {
                const processedQuotaLimits = processQuotaLimit(data);
                return {
                    limits: data?.data?.limits || data?.limits || [],
                    level: data?.data?.level || data?.level,
                    processedQuotaLimits,
                };
            }),
            httpsGetWithRetry<any>(modelUsageUrl, authToken, queryParams30),
        ]);

        if (quotaLimitRes.status === 'rejected') {
            console.error('[GPU] quota/limit request failed:', quotaLimitRes.reason?.message || quotaLimitRes.reason);
        }

        const modelUsageRaw = modelUsageRes.status === 'fulfilled' ? modelUsageRes.value : undefined;
        const toolUsageRaw = toolUsageRes.status === 'fulfilled' ? toolUsageRes.value : undefined;
        const quotaLimitResponse = quotaLimitRes.status === 'fulfilled' ? quotaLimitRes.value : undefined;
        const modelUsage30Raw = modelUsage30Res.status === 'fulfilled' ? modelUsage30Res.value : undefined;

        const modelUsage = modelUsageRaw ? ensureArray<ModelUsageData>(modelUsageRaw.modelUsage || modelUsageRaw) : [];
        const toolUsage = toolUsageRaw ? ensureArray<ToolUsageData>(toolUsageRaw) : [];
        const trend = modelUsageRaw ? processTrendData(modelUsageRaw) : undefined;
        const activeDaysInfo = modelUsageRaw ? parseActiveDaysInfo(modelUsageRaw) : undefined;
        const monthTrend = modelUsage30Raw ? processTrendData(modelUsage30Raw) : undefined;
        const quotaLimits = quotaLimitResponse?.processedQuotaLimits ?? [];
        const level = quotaLimitResponse?.level;

        return {
            platform: 'glm',
            modelUsage,
            toolUsage,
            quotaLimits,
            trend,
            monthTrend,
            activeDaysInfo,
            level,
        };
    },
};
