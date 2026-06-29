import * as vscode from 'vscode';
import { UsageResponse } from '../types';
import { QUOTA_TYPE_5H, QUOTA_TYPE_WEEKLY } from '../constants';
import { ConfigManager } from '../config';
import { UserActivityState } from '../enums';
import { getCombinedColor } from './formatters';
import { calculate5HourEstimate, calculateWeeklyEstimate } from './usageEstimate';
import { buildTooltip } from './tooltipBuilder';

export class StatusBarManager implements vscode.Disposable {
    private statusItem: vscode.StatusBarItem;
    private lastResponse: UsageResponse | null = null;
    private userActivityState: UserActivityState = UserActivityState.ACTIVE;
    private static readonly COLOR_AFK = new vscode.ThemeColor('disabledForeground');

    constructor() {
        this.statusItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );

        this.statusItem.command = 'glmPlanUsage.refresh';
        this.statusItem.text = `$(loading~spin) ${this.platformLabel()}`;
        this.statusItem.hide();
    }

    /** 当前激活平台的紧凑前缀（如 GLM / Kimi / Doubao）。 */
    private platformLabel(): string {
        return ConfigManager.getActivePlatform().descriptor.shortLabel;
    }

    /** 当前激活平台的完整展示名（用于标题）。 */
    private platformTitle(): string {
        return ConfigManager.getActivePlatform().descriptor.displayName;
    }

    show(): void {
        this.statusItem.show();
    }

    refreshTooltip(): void {
        this.statusItem.hide();
        this.statusItem.show();
    }

    setUserActivityState(state: UserActivityState): void {
        this.userActivityState = state;
        this.updateStatusBarAppearance();
    }

    private updateStatusBarAppearance(): void {
        if (this.userActivityState === UserActivityState.AFK) {
            this.statusItem.backgroundColor = undefined;
            this.statusItem.color = StatusBarManager.COLOR_AFK;
            this.statusItem.text = `$(clock) ${this.platformLabel()} AFK`;
            this.statusItem.tooltip = undefined;
        } else if (this.lastResponse) {
            this.updateUsage(this.lastResponse);
        }
        this.statusItem.show();
    }

    hide(): void {
        this.statusItem.hide();
    }

    setLoading(): void {
        this.statusItem.backgroundColor = undefined;
        this.statusItem.text = `$(loading~spin) ${this.platformLabel()}`;
        this.statusItem.tooltip = vscode.l10n.t('Querying...');
        this.show();
    }

    updateUsage(response: UsageResponse): void {
        this.lastResponse = response;
        const label = this.platformLabel();
        const fiveHourLimit = response.quotaLimits.find(
            (limit) => limit.type === QUOTA_TYPE_5H
        );
        const weeklyLimit = response.quotaLimits.find(
            (limit) => limit.type === QUOTA_TYPE_WEEKLY
        );

        const fiveHourPct = fiveHourLimit?.percentage;
        const weeklyPct = weeklyLimit?.percentage;

        // 状态栏只显示「约束配额」(5h/周中更接近上限的那个) 的单一百分比——一眼可知离限额多远；
        // 两个配额的明细与重置倒计时在 tooltip 里，避免无标签双百分比的歧义。
        const hasQuota = fiveHourLimit !== undefined || weeklyLimit !== undefined;
        const bindingPct = Math.max(fiveHourPct ?? 0, weeklyPct ?? 0);
        this.statusItem.text = hasQuota
            ? `$(pulse) ${label}  ${Math.round(bindingPct)}%`
            : `$(pulse) ${label}  N/A`;

        const fiveHourEstimate = fiveHourLimit ? calculate5HourEstimate(fiveHourLimit.percentage, fiveHourLimit.nextResetTime) : null;
        const weeklyEstimate = weeklyLimit ? calculateWeeklyEstimate(weeklyLimit.percentage, weeklyLimit.nextResetTime) : null;
        // 缺失百分比视为「不充裕」（与原 ! 断言在 undefined 时的运行时行为一致）
        const bothSufficient = (fiveHourPct ?? 101) < 70 && (weeklyPct ?? 101) < 70 && (!fiveHourEstimate || !fiveHourEstimate.willExceed) && (!weeklyEstimate || !weeklyEstimate.willExceed);
        if (bindingPct >= 90) {
            // ≥90% 用 VS Code 原生错误胶囊样式，更醒目
            this.statusItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
            this.statusItem.color = new vscode.ThemeColor('statusBarItem.errorForeground');
        } else {
            this.statusItem.backgroundColor = undefined;
            this.statusItem.color = bothSufficient ? '#6db987' : getCombinedColor({ fiveHourPct, weeklyPct });
        }
        this.statusItem.tooltip = buildTooltip(response);
        this.show();
    }

    setError(message: string): void {
        this.statusItem.text = `$(error) ${this.platformLabel()}`;
        this.statusItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        this.statusItem.color = new vscode.ThemeColor('statusBarItem.errorForeground');
        const md = new vscode.MarkdownString();
        md.appendMarkdown(`### $(error) ${this.platformTitle()}\n\n`);
        md.appendMarkdown(`${message}\n\n`);
        md.appendMarkdown(`*${vscode.l10n.t('Click to retry')}*`);
        this.statusItem.tooltip = md;
        this.statusItem.show();
    }

    setNotConfigured(): void {
        this.statusItem.text = `$(settings-gear) ${this.platformLabel()}`;
        this.statusItem.backgroundColor = undefined;
        this.statusItem.color = undefined;
        const md = new vscode.MarkdownString();
        md.appendMarkdown(`### $(settings-gear) ${this.platformTitle()}\n\n`);
        md.appendMarkdown(`${vscode.l10n.t('API Key not configured.')}\n\n`);
        md.appendMarkdown(`*${vscode.l10n.t('Click to configure')}*`);
        this.statusItem.tooltip = md;
        this.statusItem.show();
    }

    dispose(): void {
        this.statusItem.dispose();
    }
}
