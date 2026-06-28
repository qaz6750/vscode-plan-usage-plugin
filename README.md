# Coding Plan Usage

[Scroll down for English introduction](#english)

---

状态栏中实时监控各类 **Coding Plan** 的配额使用情况。采用可插拔的平台适配器架构，开箱支持 **GLM（智谱 / Z.ai）**，并预留 **Kimi（月之暗面）**、**豆包（火山引擎方舟）** 等平台接入位。

### 功能特性

- **多平台支持**：可插拔适配器架构，通过 `glmPlanUsage.platform` 切换平台（`auto` 自动按地址识别）
- **状态栏监控**：实时显示 5 小时/周配额百分比，颜色预警（🟥≥90% / 🟨70-89% / 🟩<70%），预估充裕时始终显示绿色
- **侧边栏面板**：活动栏专属面板，展示完整用量统计、配额信息和趋势图表
- **多模型统计**：按模型分类展示今日用量和 30 天使用趋势
- **悬停详情**：配额信息、套餐级别、七天用量及今日趋势图
- **MCP 用量**：每月 MCP 工具调用配额监控，含进度条与用量预估（用量为0时不显示）
- **使用预估**：基于当前消耗速率预测配额使用情况（使用量 ≥ 50% 时显示）
- **今日统计**：Token 用量、调用次数、峰值数据
- **趋势图表**：Unicode 柱状图展示每小时使用趋势
- **配额预警**：使用率 ≥ 90% 自动通知
- **自动刷新** · **中英双语** · **API Key 加密存储**

### 支持的平台

| 平台 | 状态 | 典型 Base URL |
|------|------|---------------|
| GLM（智谱 / Z.ai） | ✅ 已接入 | `https://open.bigmodel.cn/api/anthropic` |
| Kimi（月之暗面） | 🚧 脚手架，待接入真实 API | `https://api.moonshot.cn/v1` |
| 豆包（火山引擎方舟） | 🚧 脚手架，待接入真实 API | `https://ark.cn-beijing.volces.com/api/v3` |

> 想接入新平台？在 `src/platforms/<id>/index.ts` 实现一个 `PlatformAdapter` 并在 `registry.ts` 注册即可，下游估算/历史/警告/侧栏管线无需改动。

### GLM 套餐配额

GLM 各等级套餐的 5 小时和周配额限制（仅供参考，数据截至 2026-06-19）：

| 套餐 | 5h Token 配额 | 5h 调用次数 | 周 Token 配额 | 周调用次数 |
|:----:|-------------:|----------:|-------------:|---------:|
| Lite | 11.86M | 105 | 59.30M | 527 |
| Pro | 59.30M | 527 | 296.52M | 2,635 |
| Max | 237.22M | 2,108 | 1,186.09M | 10,540 |

> 注：Lite 套餐的 5h 配额基于 Pro ÷ 5 取整，实际产品中可能略有差异。周配额 = 5h 配额 × 5；Pro = Lite × 5；Max = Pro × 4。其他平台的套餐配额由各平台适配器自行定义。

### 界面预览

#### 状态栏

![状态栏](https://raw.githubusercontent.com/sage-z-cn/vscode-glm-plan-usage-plugin/master/screenshots/statusbar-zh.png)

#### 侧边栏面板

![侧边栏](https://raw.githubusercontent.com/sage-z-cn/vscode-glm-plan-usage-plugin/master/screenshots/sidebar-zh.png)

### 配置

在设置中配置（`Ctrl+,`）：

| 设置项 | 说明 | 默认值 |
|--------|------|--------|
| `glmPlanUsage.platform` | 平台选择：`auto`（按地址自动识别）/ `glm` / `kimi` / `doubao` | `auto` |
| `glmPlanUsage.baseUrl` | 所选平台的 API 地址 | `https://open.bigmodel.cn/api/anthropic` |
| `glmPlanUsage.autoRefresh` | 启动时自动刷新 | `true` |
| `glmPlanUsage.refreshInterval` | 自动刷新间隔（秒），`0` 为禁用 | `300` |
| `glmPlanUsage.enableRetry` | 请求失败时自动重试（最多3次） | `true` |
| `glmPlanUsage.showQuotaRate` | 侧边栏显示配额消耗图表 | `true` |

#### 安全存储说明

**设置 API Key**

推荐使用命令方式设置（加密存储，绝不写入文件）：

1. 打开命令面板（`Ctrl+Shift+P`）
2. 输入 `Coding Plan Usage: Set API Key`
3. 在弹出的输入框中粘贴你的 API Key（输入框已启用密码模式，安全输入）
4. 按 Enter 确认保存

> **⚡ 安全性说明**：此命令使用 VS Code SecretStorage API，API Key 将通过操作系统密钥管理器加密存储，绝不会写入任何配置文件或 Git 仓库。

#### 各平台 API 地址参考

| 平台 | 地址 |
|------|------|
| GLM（智谱） | `https://open.bigmodel.cn/api/anthropic` |
| GLM 开发环境 | `https://dev.bigmodel.cn/api/anthropic` |
| Z.ai | `https://api.z.ai/api/anthropic` |
| Kimi（待接入） | `https://api.moonshot.cn/v1` |
| 豆包（待接入） | `https://ark.cn-beijing.volces.com/api/v3` |

#### 获取 API Key

- **GLM 平台**：登录 [open.bigmodel.cn](https://open.bigmodel.cn)，在 API Keys 页面获取
- **Z.ai 平台**：登录 [z.ai](https://z.ai)，在账户设置中获取

---

<a name="english"></a>
## Introduction

Real-time monitoring of **Coding Plan** quota usage in the status bar. Built on a pluggable platform-adapter architecture — supports **GLM (Zhipu / Z.ai)** out of the box, with **Kimi (Moonshot)** and **Doubao (Volcengine Ark)** scaffolded for future integration.

### Features

- **Multi-Platform**: Pluggable adapter architecture; switch platforms via `glmPlanUsage.platform` (`auto` detects from the base URL)
- **Status Bar**: Real-time 5h/weekly quota %, color-coded alerts (🟥≥90% / 🟡70-89% / 🟢<70%), always green when usage estimate is sufficient
- **Sidebar Panel**: Dedicated activity bar panel with full usage stats, quota details, and trend charts
- **Multi-Model Stats**: Per-model daily usage and 30-day usage trend display
- **Rich Tooltip**: Quota details, plan level, 7-day usage & today's trend chart
- **MCP Usage**: Monthly MCP tool call quota monitoring with progress bar & usage estimate (hidden when usage is 0)
- **Usage Estimate**: Predict quota usage based on current consumption rate (shown when usage ≥ 50%)
- **Today Stats**: Token usage, call count, peak data
- **Trend Chart**: Unicode bar chart for hourly usage trends
- **Quota Warning**: Auto notification at ≥90%
- **Auto Refresh** · **i18n (EN/中文)** · **Encrypted API Key Storage**

### Supported Platforms

| Platform | Status | Typical Base URL |
|------|------|---------------|
| GLM (Zhipu / Z.ai) | ✅ Connected | `https://open.bigmodel.cn/api/anthropic` |
| Kimi (Moonshot) | 🚧 Scaffold, real API pending | `https://api.moonshot.cn/v1` |
| Doubao (Volcengine Ark) | 🚧 Scaffold, real API pending | `https://ark.cn-beijing.volces.com/api/v3` |

> Want to add a new platform? Implement a `PlatformAdapter` in `src/platforms/<id>/index.ts` and register it in `registry.ts` — no changes needed to the downstream estimate/history/warning/sidebar pipeline.

### GLM Plan Quotas

GLM 5-hour and weekly quota limits for each plan tier (for reference only, data as of 2026-06-19):

| Plan | 5h Tokens | 5h Calls | Weekly Tokens | Weekly Calls |
|:----:|----------:|--------:|-------------:|------------:|
| Lite | 11.86M | 105 | 59.30M | 527 |
| Pro | 59.30M | 527 | 296.52M | 2,635 |
| Max | 237.22M | 2,108 | 1,186.09M | 10,540 |

> Note: Lite tier 5h quotas are based on Pro ÷ 5, rounded. Actual product values may differ slightly. Weekly = 5h × 5; Pro = Lite × 5; Max = Pro × 4. Plan quotas for other platforms are defined by their own adapters.

### UI Preview

#### Status Bar

![Status Bar](https://raw.githubusercontent.com/sage-z-cn/vscode-glm-plan-usage-plugin/master/screenshots/statusbar-en.png)

#### Sidebar Panel

![Sidebar](https://raw.githubusercontent.com/sage-z-cn/vscode-glm-plan-usage-plugin/master/screenshots/sidebar-en.png)

### Configuration

Configure in settings (`Ctrl+,`):

| Setting | Description | Default |
|--------|------|--------|
| `glmPlanUsage.platform` | Platform: `auto` (detect from URL) / `glm` / `kimi` / `doubao` | `auto` |
| `glmPlanUsage.baseUrl` | API URL for the selected platform | `https://open.bigmodel.cn/api/anthropic` |
| `glmPlanUsage.autoRefresh` | Auto refresh on startup | `true` |
| `glmPlanUsage.refreshInterval` | Auto refresh interval (seconds), `0` to disable | `300` |
| `glmPlanUsage.enableRetry` | Automatically retry on request failure (up to 3 retries) | `true` |
| `glmPlanUsage.showQuotaRate` | Show quota consumption chart in sidebar | `true` |

#### Secure Storage

**Set API Key**

Use the command to set your API Key (encrypted storage, never written to files):

1. Open command palette (`Ctrl+Shift+P`)
2. Type `Coding Plan Usage: Set API Key`
3. Paste your API Key in the input dialog (password mode enabled for secure input)
4. Press Enter to save

> **⚡ Security Note**: This command uses VS Code SecretStorage API. Your API Key will be encrypted by the OS keychain manager and never written to any config file or Git repository.

#### Platform API URLs Reference

| Platform | URL |
|------|------|
| GLM (Zhipu) | `https://open.bigmodel.cn/api/anthropic` |
| GLM Dev | `https://dev.bigmodel.cn/api/anthropic` |
| Z.ai | `https://api.z.ai/api/anthropic` |
| Kimi (pending) | `https://api.moonshot.cn/v1` |
| Doubao (pending) | `https://ark.cn-beijing.volces.com/api/v3` |

#### Get API Key

- **GLM Platform**: Login to [open.bigmodel.cn](https://open.bigmodel.cn), get it from the API Keys page
- **Z.ai Platform**: Login to [z.ai](https://z.ai), get it from account settings
