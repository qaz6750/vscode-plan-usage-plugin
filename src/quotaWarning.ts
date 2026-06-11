import * as vscode from 'vscode';
import { UsageResponse, QuotaLimitData } from './types';
import { QUOTA_TYPE_5H, QUOTA_TYPE_WEEKLY } from './constants';

const WARNED_RESET_TIMES_KEY = 'glmPlanUsage.warnedResetTimes';

export class QuotaWarningChecker {
    constructor(private readonly globalState: vscode.Memento) {}

    private getWarnedResetTimes(): Set<number> {
        const stored = this.globalState.get<number[]>(WARNED_RESET_TIMES_KEY, []);
        return new Set(stored);
    }

    private async saveWarnedResetTimes(warnedSet: Set<number>): Promise<void> {
        await this.globalState.update(WARNED_RESET_TIMES_KEY, Array.from(warnedSet));
    }

    async check(response: UsageResponse): Promise<void> {
        // 非聚焦窗口不处理警告——各窗口独立轮询，无需延迟等聚焦窗口
        if (!vscode.window.state.focused) {
            return;
        }

        const now = Date.now();
        const warnedResetTimes = this.getWarnedResetTimes();

        // 清理过期条目
        let cleaned = false;
        for (const resetTime of warnedResetTimes) {
            if (resetTime < now) {
                warnedResetTimes.delete(resetTime);
                cleaned = true;
            }
        }
        if (cleaned) {
            await this.saveWarnedResetTimes(warnedResetTimes);
        }

        // 检查并通知
        for (const item of response.quotaLimits) {
            if (item.percentage >= 90 && item.nextResetTime && !warnedResetTimes.has(item.nextResetTime)) {
                await this.showWarning(item);
            }
        }
    }

    private async showWarning(item: QuotaLimitData): Promise<void> {
        const resetTime = item.nextResetTime!;

        // 双重检查：可能在本轮其他警告处理中已被标记
        if (this.getWarnedResetTimes().has(resetTime)) {
            return;
        }

        await this.markResetTimeWarned(resetTime);
        this.displayWarning(item);
    }

    private async markResetTimeWarned(resetTime: number): Promise<void> {
        const warnedSet = this.getWarnedResetTimes();
        const now = Date.now();
        for (const t of warnedSet) {
            if (t < now) {
                warnedSet.delete(t);
            }
        }
        warnedSet.add(resetTime);
        await this.saveWarnedResetTimes(warnedSet);
    }

    private displayWarning(item: QuotaLimitData): void {
        if (item.type === QUOTA_TYPE_5H) {
            vscode.window.showWarningMessage(
                vscode.l10n.t('GLM Plan 5-hour quota warning: {0}% used', item.percentage.toFixed(1))
            );
        } else if (item.type === QUOTA_TYPE_WEEKLY) {
            vscode.window.showWarningMessage(
                vscode.l10n.t('GLM Plan weekly quota warning: {0}% used', item.percentage.toFixed(1))
            );
        } else {
            vscode.window.showWarningMessage(
                vscode.l10n.t('GLM Plan quota warning: {0} has reached {1}%', item.type, item.percentage.toFixed(1))
            );
        }
    }
}
