/**
 * 平台适配器抽象层 —— 让插件支持多种 Coding Plan 平台（GLM、Kimi、豆包 等）。
 *
 * 设计要点：
 * - 每个平台实现一个 `PlatformAdapter`，自带「套餐档位定义」「基础 URL 自动识别」
 *   「配置校验」「用量查询」四项能力。
 * - 适配器产出的 `QuotaLimitData` 必须归一化到 {@link QUOTA_TYPE_5H} /
 *   {@link QUOTA_TYPE_WEEKLY} / {@link QUOTA_TYPE_MCP} 这几个规范类型，从而让
 *   下游的状态栏 / 估算 / 历史记录 / 侧边栏管线无需感知平台差异。
 */
import type { UsageResponse, UsageQueryConfig } from '../types';

/**
 * 平台标识，如 'glm'、'kimi'、'doubao'。用于设置项与存储键。
 */
export type PlatformId = string;

// 本地已绑定 UsageQueryConfig（供本文件 interface 使用），并再导出供平台模块统一引用。
export type { UsageQueryConfig } from '../types';

/** 平台的静态描述信息。 */
export interface PlatformDescriptor {
    /** 稳定 id，如 'glm'。用于设置项与存储键。 */
    id: PlatformId;
    /** 完整展示名，用于标题，如 'GLM Coding Plan Usage'。 */
    displayName: string;
    /** 状态栏紧凑前缀，如 'GLM'。 */
    shortLabel: string;
    /** 人类可读描述。 */
    description: string;
    /** 当 platform 设置为 'auto' 时，用于根据 baseUrl 自动识别平台的关键字。 */
    baseUrls: string[];
    /** 未配置 baseUrl 时的默认值。 */
    defaultBaseUrl: string;
    /** API / 鉴权文档链接（可选）。 */
    docsUrl?: string;
}

/** 平台提供的某一档订阅套餐（如 GLM 的 Lite/Pro/Max）。 */
export interface PlatformPlan {
    /** 档位编码，与 API 返回的 `level` 做大小写不敏感匹配。 */
    level: string;
    /** 档位展示名。 */
    displayName: string;
    /** 可选的 token / 调用次数配额常量（并非所有平台都暴露）。 */
    quota?: {
        tokens5h?: number;
        calls5h?: number;
        tokensWeekly?: number;
        callsWeekly?: number;
    };
}

/** 平台适配器契约。 */
export interface PlatformAdapter {
    readonly descriptor: PlatformDescriptor;
    /** 该平台提供的套餐档位列表。 */
    readonly plans: PlatformPlan[];
    /** 标记尚未接入真实 API 的脚手架适配器。 */
    readonly isStub?: boolean;

    /** 该适配器是否认领给定的 baseUrl（用于自动识别）。 */
    matchesBaseUrl(baseUrl: string): boolean;
    /** 校验该平台的连接配置。 */
    validateConfig(config: UsageQueryConfig): { valid: boolean; error?: string };
    /** 从平台拉取用量统计。 */
    queryUsage(config: UsageQueryConfig): Promise<UsageResponse>;
    /** 按档位编码查找套餐（大小写不敏感）。 */
    getPlan(level: string): PlatformPlan | undefined;
}
