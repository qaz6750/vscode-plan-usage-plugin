/**
 * Kimi（月之暗面 Moonshot）平台适配器 —— 脚手架。
 *
 * 当前仅提供「平台描述 + 套餐档位定义 + 自动识别」，queryUsage 尚未接入真实 API。
 * 接入步骤：
 *   1. 确认 Kimi 的用量/套餐查询端点与鉴权方式（参考 docsUrl）。
 *   2. 在 queryUsage 中实现真实请求，并把原生配额类型归一化到
 *      QUOTA_TYPE_5H / QUOTA_TYPE_WEEKLY / QUOTA_TYPE_MCP。
 *   3. 校正下方 baseUrls 与套餐档位常量。
 */
import * as vscode from 'vscode';
import { UsageResponse } from '../../types';
import { PlatformAdapter, PlatformPlan, UsageQueryConfig } from '../types';

const descriptor = {
    id: 'kimi',
    displayName: 'Kimi Coding Plan',
    shortLabel: 'Kimi',
    description: '月之暗面 Kimi（Moonshot）—— 脚手架，待接入真实 API',
    // 占位：实际接入时请替换为真实域名
    baseUrls: ['api.moonshot.cn', 'moonshot.cn'],
    defaultBaseUrl: 'https://api.moonshot.cn/v1',
    docsUrl: 'https://platform.moonshot.cn',
};

// 占位套餐档位：实际接入时请按 Kimi 真实套餐校正档位名与配额。
const plans: PlatformPlan[] = [
    { level: 'Free', displayName: 'Free' },
    { level: 'Standard', displayName: 'Standard' },
    { level: 'Pro', displayName: 'Pro' },
];

export const kimiAdapter: PlatformAdapter = {
    descriptor,
    plans,
    isStub: true,

    matchesBaseUrl(baseUrl: string): boolean {
        return descriptor.baseUrls.some((b) => baseUrl.includes(b));
    },

    validateConfig({ authToken, baseUrl }: UsageQueryConfig): { valid: boolean; error?: string } {
        if (!authToken) { return { valid: false }; }
        if (!baseUrl) { return { valid: false }; }
        return { valid: true };
    },

    getPlan(level: string): PlatformPlan | undefined {
        if (!level) { return undefined; }
        const lower = level.toLowerCase();
        return plans.find((p) => p.level.toLowerCase() === lower);
    },

    async queryUsage(_config: UsageQueryConfig): Promise<UsageResponse> {
        console.warn(
            `[${descriptor.shortLabel}] 这是脚手架适配器。请在 src/platforms/${descriptor.id}/index.ts 中实现真实 queryUsage()。`
        );
        throw new Error(
            vscode.l10n.t(
                '{0} platform is not connected to a real API yet. Please implement queryUsage() in its adapter (src/platforms/{1}/index.ts).',
                descriptor.displayName,
                descriptor.id
            )
        );
    },
};
