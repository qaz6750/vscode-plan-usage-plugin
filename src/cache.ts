import * as vscode from 'vscode';
import { UsageResponse } from './types';
import { ConfigManager } from './config';

interface CachedUsage {
    data: UsageResponse;
    timestamp: number;
}

/**
 * 用量缓存。
 *
 * 优化点：
 * - **内存优先**：热路径命中内存，避免每次刷新都读 `globalState`（落盘 JSON）。
 *   `globalState` 仅用于重启后恢复一次，以及 set 时异步落盘。
 * - **按平台隔离**：存储 key 拼上平台 id，切换平台时不会短暂显示上一平台的数据。
 */
export class UsageCache {
    /** 内存缓存（热路径） */
    private mem: UsageResponse | null = null;
    private memTimestamp = 0;
    private memPlatform: string | null = null;

    constructor(private readonly globalState: vscode.Memento) {}

    /** 当前激活平台的稳定 id。 */
    private platformId(): string {
        return ConfigManager.getActivePlatform().descriptor.id;
    }

    /** 带平台维度的存储 key。 */
    private storageKey(): string {
        return `glmPlanUsage.cache.${this.platformId()}`;
    }

    /** 缓存 TTL（毫秒），与刷新间隔对齐并留 5s 余量。 */
    private ttlMs(): number {
        return Math.max(ConfigManager.getRefreshInterval() - 5, 0) * 1000;
    }

    get(): UsageResponse | null {
        const platform = this.platformId();
        const ttl = this.ttlMs();

        // 1) 内存命中（平台一致且未过期）→ 零磁盘 IO
        if (this.mem && this.memPlatform === platform && Date.now() - this.memTimestamp <= ttl) {
            return this.mem;
        }

        // 2) 回退到持久化（仅用于重启恢复）
        const cached = this.globalState.get<CachedUsage>(this.storageKey());
        if (!cached || Date.now() - cached.timestamp > ttl) {
            return null;
        }
        this.mem = cached.data;
        this.memTimestamp = cached.timestamp;
        this.memPlatform = platform;
        return cached.data;
    }

    set(data: UsageResponse): void {
        const platform = this.platformId();
        this.mem = data;
        this.memTimestamp = Date.now();
        this.memPlatform = platform;
        // 落盘用于重启恢复（每周期一次写，可接受）
        this.globalState.update(this.storageKey(), { data, timestamp: this.memTimestamp } as CachedUsage);
    }
}
