// 配额类型常量
export const QUOTA_TYPE_5H = 'Token usage(5 Hour)';
export const QUOTA_TYPE_WEEKLY = 'Token usage(Weekly)';
export const QUOTA_TYPE_MCP = 'MCP usage(1 Month)';

/**
 * 套餐档位（Lite/Pro/Max 等）与对应配额常量已迁移至各平台适配器
 * （见 src/platforms/<platform>/index.ts）。这样不同平台可定义各自档位，
 * 而下游管线只需依赖上面这几个规范配额类型常量即可保持平台无关。
 *
 * 各适配器产出 QuotaLimitData 时，须把原生配额类型归一化到
 * QUOTA_TYPE_5H / QUOTA_TYPE_WEEKLY / QUOTA_TYPE_MCP。
 */

