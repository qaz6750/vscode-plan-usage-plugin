/* eslint-disable @typescript-eslint/no-explicit-any -- postProcessor 接收任意已解析的服务器 JSON */
/**
 * 平台无关的 HTTPS 客户端（从 usageQuery.ts 抽离）。
 *
 * 供各平台适配器复用：自动重试、超时、统一的状态码错误信息。
 */
import * as vscode from 'vscode';
import * as https from 'https';
import { URL } from 'url';
import { ConfigManager } from '../config';

const MAX_RETRY_COUNT = 3;
const RETRY_BASE_DELAY_MS = 1000;
const RETRY_MAX_DELAY_MS = 8000;

/** 调试开关：仅 CODING_PLAN_DEBUG/GLM_DEBUG 为 'true' 时输出请求/响应明细，避免生产环境刷屏与泄露响应体。 */
const DEBUG = process.env.CODING_PLAN_DEBUG === 'true' || process.env.GLM_DEBUG === 'true';
function debugLog(...args: unknown[]): void { if (DEBUG) { console.log(...args); } }

/**
 * 指数退避 + 抖动：base × 2^(attempt-1)，封顶 max，再叠加 75%–125% 随机抖动。
 * 相比线性退避，更适合 429/5xx 限流场景，避免多客户端同步重试造成惊群。
 */
function computeBackoffDelay(attempt: number): number {
    const exp = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
    const capped = Math.min(exp, RETRY_MAX_DELAY_MS);
    const jitter = capped * (0.75 + Math.random() * 0.5);
    return Math.round(jitter);
}

/** 判断错误是否可重试（网络错误、超时、5xx、429）。 */
export function isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
        const msg = error.message;
        if (msg.includes('ECONNRESET') || msg.includes('ETIMEDOUT') ||
            msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED') ||
            msg.includes('socket hang up') || msg.includes('timeout')) {
            return true;
        }
        if (msg.includes('HTTP 5')) { return true; }
        if (msg.includes('HTTP 429')) { return true; }
    }
    return false;
}

/** 带重试的 HTTPS GET（是否重试跟随 `glmPlanUsage.enableRetry` 设置）。 */
export async function httpsGetWithRetry<T>(
    url: string,
    authToken: string,
    queryParams?: string,
    postProcessor?: (data: any) => T
): Promise<T> {
    const shouldRetry = ConfigManager.isRetryEnabled();
    let lastError: unknown;

    const maxAttempts = shouldRetry ? MAX_RETRY_COUNT + 1 : 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await httpsGet(url, authToken, queryParams, postProcessor);
        } catch (error) {
            lastError = error;
            if (attempt < maxAttempts && isRetryableError(error)) {
                const delay = computeBackoffDelay(attempt);
                debugLog(`[GPU] Retry ${attempt}/${MAX_RETRY_COUNT} for ${url} in ${delay}ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }

    throw lastError;
}

/** 单次 HTTPS GET。 */
export function httpsGet<T>(
    url: string,
    authToken: string,
    queryParams?: string,
    postProcessor?: (data: any) => T
): Promise<T> {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const fullPath = parsedUrl.pathname + (queryParams || '');
        const options = {
            hostname: parsedUrl.hostname,
            port: 443,
            path: fullPath,
            method: 'GET',
            headers: {
                'Authorization': authToken,
                'Accept-Language': 'en-US,en',
                'Content-Type': 'application/json'
            }
        };

        debugLog(`[GPU] Request: GET ${parsedUrl.hostname}${fullPath}`);

        let settled = false;
        const reqStartTime = Date.now();

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (settled) { return; }
                settled = true;

                const statusCode = res.statusCode ?? 0;
                debugLog(`[GPU] Response: ${statusCode} from ${parsedUrl.hostname}${parsedUrl.pathname}`);

                if (statusCode !== 200) {
                    console.error(`[GPU] HTTP Error ${statusCode}: ${data.substring(0, 500)}`);
                    let errorMsg: string;
                    if (statusCode === 401) {
                        errorMsg = vscode.l10n.t('Authentication failed (HTTP 401). Please check your API Key.');
                    } else if (statusCode === 403) {
                        errorMsg = vscode.l10n.t('Access denied (HTTP 403). Please check your API Key permissions.');
                    } else if (statusCode === 429) {
                        errorMsg = vscode.l10n.t('Rate limit exceeded (HTTP 429). Please try again later.');
                    } else if (statusCode >= 500) {
                        errorMsg = vscode.l10n.t('Server error (HTTP {0}). Please try again later.', statusCode);
                    } else {
                        errorMsg = vscode.l10n.t('Request failed (HTTP {0}).', statusCode);
                    }
                    reject(new Error(errorMsg));
                    return;
                }

                try {
                    debugLog(`[GPU] Raw response (first 1000 chars): ${data.substring(0, 1000)}`);
                    const json = JSON.parse(data);
                    let outputData = json.data || json;
                    if (postProcessor) {
                        outputData = postProcessor(outputData);
                    }
                    resolve(outputData);
                } catch (e) {
                    console.error(`[GPU] JSON parse failed:`, e);
                    console.error(`[GPU] Raw response that failed to parse (first 2000 chars): ${data.substring(0, 2000)}`);
                    reject(new Error(vscode.l10n.t('Failed to parse response from server.')));
                }
            });
        });

        const timeoutId = setTimeout(() => {
            if (settled) { return; }
            settled = true;
            req.destroy();
            const elapsed = Date.now() - reqStartTime;
            console.error(`[GPU] Request timeout for ${parsedUrl.hostname}${fullPath} (elapsed ${elapsed}ms / 60000ms)`);
            reject(new Error(vscode.l10n.t('Request timeout after 60 seconds')));
        }, 60000);

        req.on('error', (error) => {
            if (settled) { return; }
            settled = true;
            clearTimeout(timeoutId);
            console.error(`[GPU] Request error (elapsed ${Date.now() - reqStartTime}ms):`, error);
            reject(error);
        });

        req.end();
    });
}
