import * as vscode from 'vscode';
import { UsageResponse, QuotaRatePoint, QuotaRateData, HourlyQuotaStats, DailyQuotaStats } from '../types';
import { QUOTA_TYPE_5H, QUOTA_TYPE_WEEKLY, QUOTA_TYPE_MCP } from '../constants';
import { ConfigManager } from '../config';
import type { CostEstimate } from '../platforms';
import { formatTokens, formatResetTime, formatDateTimeOnly } from '../statusBar/formatters';
import { calculate5HourEstimate, calculateWeeklyEstimate, calculateMonthlyEstimate } from '../statusBar/usageEstimate';
import { filterTodayData, filterTodayDataByModel, aggregateDailyData, aggregateDailyDataByModel, aggregateDailyCalls, aggregateDailyCallsByModel, getPeakToken, getPeakCalls } from '../statusBar/tooltipBuilder';

function colorForPercentage(pct: number): string {
    if (pct >= 90) { return '#F44747'; }
    if (pct >= 70) { return '#CCA700'; }
    return '#89D185';
}

function formatEstimate(percentage: number, nextResetTime: number | undefined, calcFn: (pct: number, reset: number | undefined) => { projectedPercentage: number; timeToExhaust?: string; estimatedExhaustTime?: number } | null): { estimate: string; timeToExhaust: string } {
    const result = calcFn(percentage, nextResetTime);
    if (!result || percentage < 50) { return { estimate: '', timeToExhaust: '' }; }
    const overWarning = result.projectedPercentage > 100 ? ' ⚠️' : '';
    const estimateText = `${vscode.l10n.t('Usage Estimate')}: ${result.projectedPercentage.toFixed(1)}%${overWarning}`;
    let timeText = '';
    if (result.timeToExhaust) {
        if (result.projectedPercentage <= 100) {
            timeText = `${vscode.l10n.t('Time to exhaust')}: ${vscode.l10n.t('Sufficient')}`;
        } else {
            const exhaustDate = result.estimatedExhaustTime
                ? ` (${formatDateTimeOnly(result.estimatedExhaustTime)})`
                : '';
            timeText = `${vscode.l10n.t('Time to exhaust')}: ${result.timeToExhaust}${exhaustDate}`;
        }
    }
    return { estimate: estimateText, timeToExhaust: timeText };
}

export interface QuotaItem {
    type: string;
    label: string;
    percentage: number;
    color: string;
    currentUsage?: number;
    total?: number;
    remaining?: number;
    nextReset: string;
    estimate: string;
    timeToExhaust: string;
}

export interface ModelTodayData {
    model: string;
    xTime: string[];
    yValue: (number | null)[];
    callCount: (number | null)[];
}

export interface TodayData {
    totalTokens: string;
    totalCalls: string;
    peakToken: string;
    peakCalls: string;
    xTime: string[];
    yValue: (number | null)[];
    callCount: (number | null)[];
    peakTokenValue?: number;
    peakTokenIndex?: number;
    models?: ModelTodayData[];
}

export interface ModelDailyData {
    model: string;
    dates: string[];
    tokens: number[];
    calls: number[];
    total: string;
}

export interface DailyData {
    dates: string[];
    tokens: number[];
    calls: number[];
    total: string;
    totalCalls?: string;
    models?: ModelDailyData[];
}

export interface SidebarLocales {
    title: string;
    todayUsage: string;
    dailyUsage: string;
    tokens: string;
    calls: string;
    noData: string;
    noQuotaData: string;
    updated: string;
    total: string;
    refresh: string;
    loading: string;
    tooltipTokens: string;
    nextReset: string;
    usage: string;
    remaining: string;
    last7Days: string;
    last30Days: string;
    settings: string;
    configureApiKey: string;
    quotaConsumptionRate: string;
    fiveHourRateLabel: string;
    weeklyRateLabel: string;
    dailyRateLabel: string;
    weeklyQuota: string;
    ofFiveHourQuota: string;
    ofWeeklyQuota: string;
    Sun: string;
    Mon: string;
    Tue: string;
    Wed: string;
    Thu: string;
    Fri: string;
    Sat: string;
    barChart: string;
    lineChart: string;
    todayLabel: string;
    weekLabel: string;
    /** 等价 API 花费标签 */
    estimatedCostLabel: string;
    /** 存在未精确匹配定价模型时的提示 */
    estimatedCostFallbackNote: string;
}

export interface SidebarData {
    level: string;
    updated: string;
    locales: SidebarLocales;
    quotas: QuotaItem[];
    today: TodayData | null;
    week: DailyData | null;
    month: DailyData | null;
    quotaRate: QuotaRateData;
    /** 按 API 计费折算的等价花费（无定价数据时为 null） */
    estimatedCost: CostEstimate | null;
    /** 已知模型 → 图表颜色（来自当前平台 adapter，可覆盖默认调色板） */
    modelColors: Record<string, string>;
}

export function transformResponse(response: UsageResponse, hourlyQuotaStats?: HourlyQuotaStats[], weeklyQuotaStats?: DailyQuotaStats[]): SidebarData {
    const now = new Date();

    const quotas: QuotaItem[] = [];

    const fiveHourLimit = response.quotaLimits.find(l => l.type === QUOTA_TYPE_5H);
    if (fiveHourLimit) {
        quotas.push({
            type: QUOTA_TYPE_5H,
            label: vscode.l10n.t('5 Hour Quota'),
            percentage: fiveHourLimit.percentage,
            color: colorForPercentage(fiveHourLimit.percentage),
            nextReset: formatResetTime(fiveHourLimit.nextResetTime, QUOTA_TYPE_5H),
            ...formatEstimate(fiveHourLimit.percentage, fiveHourLimit.nextResetTime, calculate5HourEstimate)
        });
    }

    const weeklyLimit = response.quotaLimits.find(l => l.type === QUOTA_TYPE_WEEKLY);
    if (weeklyLimit) {
        quotas.push({
            type: QUOTA_TYPE_WEEKLY,
            label: vscode.l10n.t('Weekly Quota'),
            percentage: weeklyLimit.percentage,
            color: colorForPercentage(weeklyLimit.percentage),
            nextReset: formatResetTime(weeklyLimit.nextResetTime, QUOTA_TYPE_WEEKLY),
            ...formatEstimate(weeklyLimit.percentage, weeklyLimit.nextResetTime, calculateWeeklyEstimate)
        });
    }

    const mcpLimit = response.quotaLimits.find(l => l.type === QUOTA_TYPE_MCP);
    if (mcpLimit && (mcpLimit.currentUsage ?? 0) > 0) {
        quotas.push({
            type: QUOTA_TYPE_MCP,
            label: vscode.l10n.t('MCP Monthly Usage'),
            percentage: mcpLimit.percentage,
            color: colorForPercentage(mcpLimit.percentage),
            currentUsage: mcpLimit.currentUsage,
            total: mcpLimit.total,
            remaining: mcpLimit.remaining,
            nextReset: formatResetTime(mcpLimit.nextResetTime, QUOTA_TYPE_MCP),
            ...formatEstimate(mcpLimit.percentage, mcpLimit.nextResetTime, calculateMonthlyEstimate)
        });
    }

    let today: TodayData | null = null;
    let week: DailyData | null = null;
    let month: DailyData | null = null;

    if (response.trend) {
        const todayData = filterTodayData(response.trend);
        const todayModelData = filterTodayDataByModel(response.trend);
        const todayModels = todayModelData.map(md => ({
            model: md.model,
            xTime: md.xTime,
            yValue: md.yValue,
            callCount: md.callCount
        }));

        today = {
            totalTokens: formatTokens(todayData.totalTokens),
            totalCalls: String(todayData.totalCalls),
            peakToken: '',
            peakCalls: '',
            xTime: todayData.xTime,
            yValue: todayData.yValue,
            callCount: todayData.modelCallCount,
            models: todayModels.length > 0 ? todayModels : undefined
        };

        const peakT = getPeakToken(todayData);
        if (peakT) {
            today.peakToken = `${vscode.l10n.t('Peak')} ${formatTokens(peakT.tokens)}@${peakT.time}`;
            today.peakTokenValue = peakT.tokens;
            today.peakTokenIndex = peakT.index;
        }
        const peakC = getPeakCalls(todayData);
        if (peakC) {
            today.peakCalls = `${vscode.l10n.t('Peak')} ${peakC.calls}@${peakC.time}`;
        }

        // 使用 monthTrend 获取7天数据（trend是小时级数据，只有今天）
        const weekSource = response.monthTrend || response.trend;
        const dailyData = aggregateDailyData(weekSource);
        if (dailyData.length > 0) {
            const last7 = dailyData.slice(-7);
            const last7Total = last7.reduce((sum, d) => sum + d.tokens, 0);
            
            const dailyCalls = aggregateDailyCalls(weekSource);
            const last7Calls = dailyCalls.slice(-7);
            const last7CallsTotal = last7Calls.reduce((sum, c) => sum + c, 0);
            
            const modelDailyData = aggregateDailyDataByModel(weekSource);
            const modelDailyCalls = aggregateDailyCallsByModel(weekSource);
            const callsByModel = new Map(modelDailyCalls.map(mc => [mc.model, mc.calls]));
            
            const last7Models = modelDailyData.map(md => {
                const modelCalls = callsByModel.get(md.model) || [];
                const callsSlice = modelCalls.slice(-7);
                return {
                    model: md.model,
                    dates: md.dates.slice(-7),
                    tokens: md.tokens.slice(-7),
                    calls: callsSlice,
                    total: formatTokens(md.tokens.slice(-7).reduce((sum, t) => sum + t, 0))
                };
            }).filter(md => md.tokens.some(t => t > 0));
            
            week = {
                dates: last7.map(d => d.date),
                tokens: last7.map(d => d.tokens),
                calls: last7Calls,
                total: formatTokens(last7Total),
                totalCalls: String(last7CallsTotal),
                models: last7Models.length > 0 ? last7Models : undefined
            };
        }

        if (response.monthTrend) {
            const monthData = aggregateDailyData(response.monthTrend);
            if (monthData.length > 0) {
                const allTotal = monthData.reduce((sum, d) => sum + d.tokens, 0);
                
                const monthCalls = aggregateDailyCalls(response.monthTrend);
                const allCallsTotal = monthCalls.reduce((sum, c) => sum + c, 0);
                
                const monthModelData = aggregateDailyDataByModel(response.monthTrend);
                const monthModelCalls = aggregateDailyCallsByModel(response.monthTrend);
                const monthCallsByModel = new Map(monthModelCalls.map(mc => [mc.model, mc.calls]));
                
                const monthModels = monthModelData.map(md => {
                    const modelCalls = monthCallsByModel.get(md.model) || [];
                    return {
                        model: md.model,
                        dates: md.dates,
                        tokens: md.tokens,
                        calls: modelCalls,
                        total: formatTokens(md.tokens.reduce((sum, t) => sum + t, 0))
                    };
                }).filter(md => md.tokens.some(t => t > 0));
                
                month = {
                    dates: monthData.map(d => d.date),
                    tokens: monthData.map(d => d.tokens),
                    calls: monthCalls,
                    total: formatTokens(allTotal),
                    totalCalls: String(allCallsTotal),
                    models: monthModels.length > 0 ? monthModels : undefined
                };
            }
        } else if (dailyData.length > 0) {
            const dailyCalls = aggregateDailyCalls(weekSource);
            month = {
                dates: dailyData.map(d => d.date),
                tokens: dailyData.map(d => d.tokens),
                calls: dailyCalls,
                total: formatTokens(dailyData.reduce((sum, d) => sum + d.tokens, 0))
            };
        }
    }

    const level = (response.level || '').toUpperCase();
    const adapter = ConfigManager.getActivePlatform();
    const platformName = adapter.descriptor.displayName;
    const title = level ? `[${level}] ${platformName}` : platformName;
    const estimatedCost = adapter.estimateCost ? adapter.estimateCost(response.modelUsage) : null;

    return {
        level,
        updated: now.toLocaleString(),
        locales: {
            title,
            todayUsage: vscode.l10n.t('Today Usage'),
            dailyUsage: vscode.l10n.t('Daily Usage'),
            tokens: vscode.l10n.t('Tokens'),
            calls: vscode.l10n.t('Calls'),
            noData: vscode.l10n.t('No data available'),
            noQuotaData: vscode.l10n.t('No data available. Please check your API Key.'),
            updated: vscode.l10n.t('Updated'),
            total: vscode.l10n.t('Total'),
            refresh: vscode.l10n.t('Refresh'),
            loading: vscode.l10n.t('Loading...'),
            tooltipTokens: vscode.l10n.t('Tokens'),
            nextReset: vscode.l10n.t('Next reset'),
            usage: vscode.l10n.t('Usage'),
            remaining: vscode.l10n.t('Remaining'),
            last7Days: vscode.l10n.t('Last 7 Days'),
            last30Days: vscode.l10n.t('Last 30 Days'),
            settings: vscode.l10n.t('Settings'),
            configureApiKey: vscode.l10n.t('Configure API Key'),
            quotaConsumptionRate: vscode.l10n.t('Quota Consumption'),
            fiveHourRateLabel: vscode.l10n.t('5h %/h'),
            weeklyRateLabel: vscode.l10n.t('Weekly %/h'),
            dailyRateLabel: vscode.l10n.t('Weekly %/d'),
            weeklyQuota: vscode.l10n.t('Weekly Quota'),
            ofFiveHourQuota: vscode.l10n.t('of 5h quota'),
            ofWeeklyQuota: vscode.l10n.t('of weekly quota'),
            todayLabel: vscode.l10n.t('Today'),
            weekLabel: vscode.l10n.t('7 Days'),
            Sun: vscode.l10n.t('Sun'),
            Mon: vscode.l10n.t('Mon'),
            Tue: vscode.l10n.t('Tue'),
            Wed: vscode.l10n.t('Wed'),
            Thu: vscode.l10n.t('Thu'),
            Fri: vscode.l10n.t('Fri'),
            Sat: vscode.l10n.t('Sat'),
            barChart: vscode.l10n.t('Bar'),
            lineChart: vscode.l10n.t('Line'),
            estimatedCostLabel: vscode.l10n.t('Equivalent API cost'),
            estimatedCostFallbackNote: vscode.l10n.t('Estimated; some models use fallback pricing'),
        },
        quotas,
        today,
        week,
        month,
        quotaRate: buildQuotaRateData(hourlyQuotaStats, weeklyQuotaStats, level),
        estimatedCost,
        modelColors: adapter.descriptor.modelColors || {}
    };
}

/**
 * 将 QuotaHistoryTracker 产出的配额百分比增量统计映射为图表 UI 所需的 QuotaRateData。
 *
 * 采用按小时记录的配额百分比快照计算消耗增量（delta），而非按 token ÷ 套餐常量估算 ——
 * 这样能正确反映不同时段、不同模型的消耗倍率差异。tokens 字段在此方案下恒为 null。
 *
 * 映射关系：
 *   hourly.pctOf5h     = HourlyQuotaStats.fiveHourDelta
 *   hourly.pctOfWeekly = HourlyQuotaStats.weeklyDelta
 *   daily.pctOfWeekly  = DailyQuotaStats.weeklyDelta
 */
function buildQuotaRateData(
    hourlyStats: HourlyQuotaStats[] | undefined,
    weeklyStats: DailyQuotaStats[] | undefined,
    level: string,
): QuotaRateData {
    const hourly: QuotaRatePoint[] = (hourlyStats || []).map(stat => ({
        label: stat.hour,
        tokens: null,
        pctOf5h: stat.fiveHourDelta,
        pctOfWeekly: stat.weeklyDelta,
        isToday: true,
    }));

    const daily: QuotaRatePoint[] = (weeklyStats || []).map(stat => ({
        label: stat.date,
        subLabel: stat.weekday,
        tokens: null,
        pctOf5h: null,
        pctOfWeekly: stat.weeklyDelta,
        isToday: stat.isToday,
    }));

    return { hourly, daily, level };
}
