/**
 * GLM 模型定价（参考价，元 / 百万 tokens）。
 *
 * 数据来源：智谱 BigModel 官网定价页 https://open.bigmodel.cn/pricing （截至 2026-06）。
 * - 采用各模型的「短上下文档位」（输入长度 [0, 32K)）价格，Coding Plan 场景以短上下文为主。
 * - GLM Coding Plan 本身是订阅制，这里把 token 用量折算为「按量 API 计费等价金额」，
 *   仅作价值参考，并非用户实际付费。
 *
 * 官网计费说明原文摘录：模型按每百万 tokens 计费；GLM 系列词表 token 与汉字换算约 1:1.6。
 */
import { ModelUsageData } from '../../types';

export interface ModelPrice {
    /** 输入价（元 / 百万 tokens） */
    inputPerMillion: number;
    /** 输出价（元 / 百万 tokens） */
    outputPerMillion: number;
}

/** 官网定价（键为小写、去空格的模型名，便于匹配）。 */
export const GLM_MODEL_PRICES: Record<string, ModelPrice> = {
    'glm-5.2': { inputPerMillion: 8, outputPerMillion: 28 },
    'glm-5.1': { inputPerMillion: 6, outputPerMillion: 24 },
    'glm-5-turbo': { inputPerMillion: 5, outputPerMillion: 22 },
    'glm-5': { inputPerMillion: 4, outputPerMillion: 18 },
    'glm-4.7': { inputPerMillion: 2, outputPerMillion: 8 },
    'glm-4.5-air': { inputPerMillion: 0.8, outputPerMillion: 2 },
};

/** 未知模型回退价（保守取旗舰 GLM-5.2 价位）。 */
const FALLBACK_PRICE: ModelPrice = { inputPerMillion: 8, outputPerMillion: 28 };

/** 规范化模型名：小写 + 去空格，便于与定价表匹配。防御 undefined/null/非字符串输入。 */
function normalize(model: string): string {
    return String(model ?? '').toLowerCase().replace(/\s+/g, '');
}

/** 查询模型定价；精确 → 前缀匹配 → 回退价。 */
export function getGlmModelPrice(model: string): { price: ModelPrice; isFallback: boolean } {
    const key = normalize(model);
    if (GLM_MODEL_PRICES[key]) {
        return { price: GLM_MODEL_PRICES[key], isFallback: false };
    }
    for (const k of Object.keys(GLM_MODEL_PRICES)) {
        if (key.startsWith(k)) {
            return { price: GLM_MODEL_PRICES[k], isFallback: false };
        }
    }
    return { price: FALLBACK_PRICE, isFallback: true };
}

export interface GlmCostEstimate {
    totalCny: number;
    perModel: { model: string; costCny: number }[];
    hasFallback: boolean;
}

/** 依据模型用量估算等价 API 计费金额（CNY）。 */
export function estimateGlmCost(modelUsage: ModelUsageData[]): GlmCostEstimate {
    let totalCny = 0;
    let hasFallback = false;
    const perModel: { model: string; costCny: number }[] = [];

    for (const m of modelUsage) {
        // 跳过缺少模型名的条目（如聚合/总计行），避免后续匹配报错
        if (!m || !m.model) { continue; }
        const { price, isFallback } = getGlmModelPrice(m.model);
        if (isFallback) { hasFallback = true; }
        const cost =
            (m.inputTokens / 1_000_000) * price.inputPerMillion +
            (m.outputTokens / 1_000_000) * price.outputPerMillion;
        totalCny += cost;
        if (cost > 0) {
            perModel.push({ model: m.model, costCny: cost });
        }
    }

    perModel.sort((a, b) => b.costCny - a.costCny);
    return { totalCny, perModel, hasFallback };
}

/**
 * 依据各模型 token 总量估算等价 API 计费金额（CNY）。
 * 趋势数据只有 token 总量、无输入/输出拆分，故按 (输入价 + 输出价) / 2 的均价估算。
 */
export function estimateGlmCostFromTotals(modelTokenTotals: { model: string; tokens: number }[]): GlmCostEstimate {
    let totalCny = 0;
    let hasFallback = false;
    const perModel: { model: string; costCny: number }[] = [];

    for (const t of modelTokenTotals) {
        if (!t || !t.model) { continue; }
        const { price, isFallback } = getGlmModelPrice(t.model);
        if (isFallback) { hasFallback = true; }
        const blended = (price.inputPerMillion + price.outputPerMillion) / 2;
        const cost = (t.tokens / 1_000_000) * blended;
        totalCny += cost;
        if (cost > 0) {
            perModel.push({ model: t.model, costCny: cost });
        }
    }

    perModel.sort((a, b) => b.costCny - a.costCny);
    return { totalCny, perModel, hasFallback };
}
