import { UsageResponse } from './types';
import { ConfigManager } from './config';
import { mockUsageResponse } from './mock-data';

/**
 * 用量查询门面。
 *
 * 真正的平台请求逻辑下沉到各 {@link PlatformAdapter}（见 src/platforms/）。
 * 本类仅负责：mock 切换 → 配置校验 → 取当前激活平台适配器 → 委派查询。
 *
 * 平台的选择由设置项 `glmPlanUsage.platform`（auto/glm/kimi/doubao…）与
 * `baseUrl` 共同决定，详见 {@link ConfigManager.getActivePlatform}。
 */
export class UsageQueryService {
    static async queryUsage(): Promise<UsageResponse> {
        // 使用 mock 数据（截图/测试用）
        if (ConfigManager.isMockDataEnabled()) {
            return mockUsageResponse;
        }

        const validation = await ConfigManager.validateConfig();
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        const adapter = ConfigManager.getActivePlatform();
        const authToken = await ConfigManager.getAuthToken();
        const baseUrl = ConfigManager.getBaseUrl();

        return adapter.queryUsage({ authToken, baseUrl });
    }
}
