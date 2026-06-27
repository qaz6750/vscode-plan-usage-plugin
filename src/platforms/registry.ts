/**
 * 平台注册表 —— 纯查找层，刻意不依赖 ConfigManager，避免与 config.ts 形成循环依赖。
 *
 * 当前激活平台的判定在 {@link ConfigManager.getActivePlatform} 中完成。
 */
import { PlatformAdapter, PlatformId } from './types';
import { glmAdapter } from './glm';
import { kimiAdapter } from './kimi';
import { doubaoAdapter } from './doubao';

/** 已注册的全部平台适配器（顺序决定设置项下拉顺序）。 */
const ADAPTERS: PlatformAdapter[] = [glmAdapter, kimiAdapter, doubaoAdapter];

export class PlatformRegistry {
    /** 列出全部已注册平台。 */
    static list(): PlatformAdapter[] {
        return ADAPTERS;
    }

    /** 按稳定 id 查找适配器。 */
    static getById(id: PlatformId): PlatformAdapter | undefined {
        return ADAPTERS.find((a) => a.descriptor.id === id);
    }

    /** 按 baseUrl 自动识别所属平台（用于 platform == 'auto'）。 */
    static getByBaseUrl(baseUrl: string): PlatformAdapter | undefined {
        if (!baseUrl) { return undefined; }
        return ADAPTERS.find((a) => a.matchesBaseUrl(baseUrl));
    }

    /** 兜底默认平台（GLM，保证向后兼容）。 */
    static getDefault(): PlatformAdapter {
        return glmAdapter;
    }
}
