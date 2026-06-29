import * as vscode from 'vscode';

export function getHtmlTemplate(echartsUri: vscode.Uri, cspSource: string, nonce: string, version: string): string {
    const echartsSrc = echartsUri.toString();

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${cspSource} https: data:; script-src 'nonce-${nonce}'; style-src ${cspSource} 'unsafe-inline';">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  padding: 10px 10px 22px;
  font-family: var(--vscode-font-family, -apple-system, 'Segoe UI', sans-serif);
  font-size: 12px;
  color: var(--vscode-foreground);
  background: var(--vscode-sideBar-background);
  user-select: none;
  position: relative;
  --card-bg: color-mix(in srgb, var(--vscode-editor-background) 80%, var(--vscode-foreground) 5%);
  --card-border: var(--vscode-panel-border);
  --accent: var(--vscode-textLink-foreground, #4daafc);
  --radius: 8px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.header .title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.1px;
}
.updated {
  font-size: 10px;
  color: var(--vscode-descriptionForeground);
  margin-bottom: 12px;
}
.section {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius);
  padding: 12px;
  margin-bottom: 10px;
}
.section-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--vscode-descriptionForeground);
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}
.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.section-stats-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}
.section-title-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.quota-item {
  margin-bottom: 12px;
}
.quota-item:last-child {
  margin-bottom: 0;
}
.quota-item + .quota-item {
  border-top: 1px solid var(--card-border);
  padding-top: 12px;
}
.quota-label {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 5px;
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
}
.quota-pct {
  font-weight: 700;
  font-size: 15px;
  font-variant-numeric: tabular-nums;
  color: var(--vscode-foreground);
}
.quota-bar-outer {
  height: 6px;
  background: color-mix(in srgb, var(--vscode-foreground) 12%, transparent);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 5px;
}
.quota-bar-inner {
  height: 100%;
  border-radius: 999px;
  transition: width 0.35s ease;
}
.quota-meta {
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0 8px;
  line-height: 1.7;
}
.quota-estimate {
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
  margin-top: 2px;
  line-height: 1.7;
}
.quota-usage-row {
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
  margin-top: 2px;
  line-height: 1.7;
}
.quota-value {
  color: var(--vscode-descriptionForeground);
}
.chart-container {
  width: 100%;
  height: 168px;
  margin-top: 4px;
}
.stat-suffix {
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.no-data {
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
  font-style: italic;
  padding: 12px 0;
  text-align: center;
}
.refresh-btn {
  background: transparent;
  border: 1px solid var(--card-border);
  color: var(--vscode-foreground);
  width: 26px;
  height: 26px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, transform 0.15s;
}
.refresh-btn:hover {
  background: var(--vscode-toolbar-hoverBackground);
}
.refresh-btn:active {
  transform: scale(0.92);
}
.radio-link-group {
  display: inline-flex;
  border: 1px solid var(--card-border);
  border-radius: 999px;
  overflow: hidden;
  background: color-mix(in srgb, var(--vscode-foreground) 6%, transparent);
}
.radio-link {
  font-size: 10px;
  padding: 3px 9px;
  color: var(--vscode-descriptionForeground);
  cursor: pointer;
  background: transparent;
  border-right: 1px solid var(--card-border);
  transition: color 0.12s, background 0.12s;
}
.radio-link:last-child {
  border-right: none;
}
.radio-link:hover {
  color: var(--vscode-foreground);
}
.radio-link.active {
  background: var(--accent);
  color: var(--vscode-editor-background);
  font-weight: 600;
  cursor: default;
}
.action-bar {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-top: 14px;
  padding-top: 12px;
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
  cursor: pointer;
  background: none;
  border: none;
  padding: 4px 8px;
  border-radius: 6px;
  transition: color 0.12s, background 0.12s;
}
.action-btn:hover {
  color: var(--vscode-foreground);
  background: var(--vscode-toolbar-hoverBackground);
}
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
}
.error-icon {
  font-size: 24px;
  margin-bottom: 8px;
}
.error-message {
  font-size: 12px;
  color: var(--vscode-errorForeground);
  margin-bottom: 12px;
}
.loading-overlay {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: color-mix(in srgb, var(--vscode-editor-background) 72%, transparent);
  backdrop-filter: blur(2px);
  z-index: 10;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 12px;
}
.loading-overlay.show { display: flex; }
.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--vscode-panel-border);
  border-top-color: var(--vscode-textLink-foreground);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.loading-text {
  font-size: 12px;
  color: var(--vscode-descriptionForeground);
}
.version {
  text-align: center;
  font-size: 10px;
  color: var(--vscode-descriptionForeground);
  opacity: 0.6;
  margin-top: 10px;
  letter-spacing: 0.3px;
}
</style>
</head>
<body>
<div class="loading-overlay" id="loading-overlay">
  <div class="loading-spinner"></div>
  <div class="loading-text" id="loading-text">Loading...</div>
</div>
<div class="header">
  <span class="title" id="header-title">Coding Plan Usage</span>
  <button class="refresh-btn" id="refresh-btn">&#x21bb;</button>
</div>
<div class="updated" id="header-updated" style="margin-bottom:10px;font-size:10px;color:var(--vscode-descriptionForeground)"></div>

<div id="error-section" style="display:none">
  <div class="error-container">
    <div class="error-icon">⚠️</div>
    <div class="error-message" id="error-message"></div>
  </div>
</div>

<div class="section" id="quota-section"></div>

<div class="section" id="quota-rate-section" style="display:none">
  <div class="section-title">
    <div class="section-title-row">
      <span id="quota-rate-section-title"></span>
      <span class="section-title-actions">
        <span class="radio-link-group" id="quota-rate-day-toggle">
          <span id="quota-rate-day-today" class="radio-link active" data-value="today">当天</span>
          <span id="quota-rate-day-week" class="radio-link" data-value="week">七天</span>
        </span>
      </span>
    </div>
  </div>
  <div id="quota-rate-chart" class="chart-container" style="height:190px"></div>
</div>

<div class="section" id="today-section" style="display:none">
  <div class="section-title">
    <div class="section-title-row">
      <span id="today-section-title"></span>
      <span class="section-title-actions">
        <span class="radio-link-group" id="today-chart-type-select">
          <span id="today-chart-bar" class="radio-link active" data-value="bar">Bar</span>
          <span id="today-chart-line" class="radio-link" data-value="line">Line</span>
        </span>
        <span class="radio-link-group" id="today-metric-select">
          <span id="today-metric-tokens" class="radio-link active" data-value="tokens">Tokens</span>
          <span id="today-metric-calls" class="radio-link" data-value="calls">Calls</span>
        </span>
      </span>
    </div>
    <div class="section-stats-row">
      <span class="stat-suffix" id="today-tokens-wrap"><span id="today-tokens-label"></span>: <span id="today-tokens">--</span></span>
      <span class="stat-suffix" id="today-calls-wrap"><span id="today-calls-label"></span>: <span id="today-calls">--</span></span>
    </div>
    <div class="section-stats-row" id="today-cost-row" style="display:none">
      <span class="stat-suffix"><span id="today-cost-label"></span>: ≈¥<span id="today-cost">--</span></span>
      <span class="stat-suffix" id="today-cost-breakdown" style="opacity:0.75"></span>
    </div>
  </div>
  <div id="today-chart" class="chart-container"></div>
</div>

<div class="section" id="week-section" style="display:none">
  <div class="section-title">
    <div class="section-title-row">
      <span id="week-section-title"></span>
      <span class="section-title-actions">
        <span class="radio-link-group" id="day-range-select"></span>
        <span class="radio-link-group" id="week-metric-select">
          <span id="week-metric-tokens" class="radio-link active" data-value="tokens">Tokens</span>
          <span id="week-metric-calls" class="radio-link" data-value="calls">Calls</span>
        </span>
      </span>
    </div>
    <div class="section-stats-row">
      <span class="stat-suffix" id="week-total"></span>
      <span class="stat-suffix" id="week-total-calls"></span>
    </div>
  </div>
  <div id="week-chart" class="chart-container" style="height:200px"></div>
</div>

<div class="no-data" id="no-data"></div>

<div class="action-bar">
  <button class="action-btn" id="settings-btn">
    <span>⚙️</span>
    <span id="settings-label">Settings</span>
  </button>
  <button class="action-btn" id="apikey-btn">
    <span>🔑</span>
    <span id="apikey-label">Configure API Key</span>
  </button>
</div>

<div class="version">Coding Plan Usage · v${version}</div>

<script nonce="${nonce}" src="${echartsSrc}"></script>
<script nonce="${nonce}">
(function() {
  const vscodeApi = acquireVsCodeApi();
  let todayChart = null;
  let weekChart = null;
  let quotaChart = null;
  let loc = {};
  let storedData = null;
  let currentRange = '7';
  let currentMetric = 'tokens';
let currentChartType = 'bar';
  let currentQuotaDayRange = 'today';
  let quotaData = [];
  let weeklyQuotaData = [];

  function showLoading(text) {
    var overlay = document.getElementById('loading-overlay');
    var label = document.getElementById('loading-text');
    if (label) label.textContent = text || 'Loading...';
    if (overlay) overlay.classList.add('show');
  }

  function hideLoading() {
    var overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.remove('show');
  }

  function isDark() {
    return document.body.classList.contains('vscode-dark') || document.body.classList.contains('vscode-high-contrast');
  }

  function chartColors() {
    if (isDark()) {
      return { text: '#999', grid: '#3a3a3a', accent: '#5B9BD5', area: 'rgba(91,155,213,0.15)' };
    }
    return { text: '#666', grid: '#e0e0e0', accent: '#2672BE', area: 'rgba(38,114,190,0.1)' };
  }

  function modelColors() {
    return ['#f38441', '#b86fe5', '#00c9a7', '#ff6b6b', '#4ecdc4', '#ffd93d', '#6c5ce7', '#a8e6cf', '#45b7d1', '#f78fb3', '#3dc1d3', '#e15f41', '#786fa6', '#f5cd79', '#546de5', '#c44569'];
  }

  var KNOWN_MODEL_COLORS = {
    // 默认回退色表；当前平台 adapter 的 modelColors 会在渲染时合并覆盖这些值
    'GLM-5.2': '#5985f5',
    'GLM-5.1': '#4ecdc4',
    'GLM-5-Turbo': '#f38441',
    'GLM-5V-Turbo': '#b86fe5',
    'GLM4.7': '#00c9a7',
    'GLM-4.6V': '#ff6b6b',
    'GLM-4.5-Air': '#ffd93d'
  };

  var TOTAL_COLOR = '#6366f1';

  function getModelColor(model, usedColors) {
    if (KNOWN_MODEL_COLORS.hasOwnProperty(model)) {
      return KNOWN_MODEL_COLORS[model];
    }
    var palette = modelColors();
    for (var i = 0; i < palette.length; i++) {
      if (usedColors.indexOf(palette[i]) === -1) {
        return palette[i];
      }
    }
    return palette[palette.length - 1];
  }

  // 复用 echarts 实例：避免每次刷新都 dispose()+init()（会反复分配 canvas/GPU 资源，造成卡顿与内存波动）。
  // clear() 清空配置达到与全新初始化相同的视觉状态，但保留实例与底层资源，大幅降低刷新开销。
  function reuseChart(chart, dom) {
    if (chart && !chart.isDisposed()) {
      chart.clear();
      return chart;
    }
    return echarts.init(dom);
  }

  function initTodayChart(data, metric, chartType) {
    try {
      const dom = document.getElementById('today-chart');
      if (!dom) return;
      todayChart = reuseChart(todayChart, dom);
      const c = chartColors();
      var usedColors = [];

      const xData = data.xTime.map(function(t) {
        const parts = t.split(' ');
        return parts.length >= 2 ? parts[1].substring(0, 2) + ':00' : t;
      });
      metric = metric || 'tokens';
      var mainData = metric === 'calls' ? (data.callCount || []) : data.yValue;
      var yData = mainData.map(function(v) { return v === null ? '-' : v; });

      // x-axis: show today's hours, trimming morning (00:00-06:00) and
      // evening (19:00-23:00) ranges when entirely without data; middle always shown.
      var origLookup = {};
      for (var oi = 0; oi < xData.length; oi++) {
        origLookup[xData[oi]] = oi;
      }
      var allTokens = data.yValue;
      var allCalls = data.callCount || [];
      function hourHasData(h) {
        var l = (h < 10 ? '0' : '') + h + ':00';
        var idx = origLookup[l];
        if (idx === undefined) return false;
        var tk = allTokens[idx];
        var cl = allCalls[idx];
        // 0 is treated as "no data" — only positive values count
        return (tk !== null && tk !== undefined && tk > 0) ||
               (cl !== null && cl !== undefined && cl > 0);
      }
      // Morning range [0, 6]: keep head only if any hour has data
      var morningHasData = false;
      for (var hm = 0; hm <= 6; hm++) { if (hourHasData(hm)) { morningHasData = true; break; } }
      // Evening range [19, 23]: keep tail only if any hour has data
      var eveningHasData = false;
      for (var he = 19; he <= 23; he++) { if (hourHasData(he)) { eveningHasData = true; break; } }
      var startH = morningHasData ? 0 : 7;
      var endH = eveningHasData ? 23 : 18;

      var slicedX = [], slicedY = [];
      for (var h = startH; h <= endH; h++) {
        var lbl = (h < 10 ? '0' : '') + h + ':00';
        slicedX.push(lbl);
        var oi2 = origLookup[lbl];
        slicedY.push(oi2 !== undefined ? yData[oi2] : '-');
      }

      var slicedModels = [];

      // Map slicedX labels back to original xData indices
      var paddedOrigIdx = {};
      for (var pi2 = 0; pi2 < slicedX.length; pi2++) {
        var lbl2 = slicedX[pi2];
        paddedOrigIdx[pi2] = origLookup[lbl2] !== undefined ? origLookup[lbl2] : -1;
      }

      // Save full data for dual-metric tooltip (closure) — padded
      var _totalTokens = [];
      var _totalCalls = [];
      for (var ti = 0; ti < slicedX.length; ti++) {
        var oi3 = paddedOrigIdx[ti];
        _totalTokens.push(oi3 >= 0 ? allTokens[oi3] : null);
        _totalCalls.push(oi3 >= 0 ? allCalls[oi3] : null);
      }
      var _modelMap = {};
      if (data.models) {
        for (var mi = 0; mi < data.models.length; mi++) {
          var md = data.models[mi];
          var mTokens = [];
          var mCalls = (md.callCount || []);
          var mData = [];
          for (var ti2 = 0; ti2 < slicedX.length; ti2++) {
            var oi4 = paddedOrigIdx[ti2];
            if (oi4 >= 0) {
              mTokens.push(md.yValue[oi4]);
              var cv = metric === 'calls' ? mCalls[oi4] : md.yValue[oi4];
              mData.push(cv === null ? '-' : cv);
            } else {
              mTokens.push(null);
              mData.push('-');
            }
          }
          _modelMap[md.model] = { tokens: mTokens, calls: (function() {
            var pc = [];
            for (var ti3 = 0; ti3 < slicedX.length; ti3++) {
              var oi5 = paddedOrigIdx[ti3];
              pc.push(oi5 >= 0 ? (md.callCount || [])[oi5] : null);
            }
            return pc;
          })() };
          slicedModels.push({ model: md.model, yValue: mData });
        }
      }

      var series = [];
      var legend = { show: false };
      chartType = chartType || 'bar';
      var isLine = chartType === 'line';
      var isBar = chartType === 'bar';

      // 检查当前 metric 下模型数据是否有效。
      // API 不提供 per-model callCount 时，calls 指标下 slicedModels 的 yValue 会全为空，
      // 此时降级走单 series 分支（用汇总数据 slicedY），保证 bar 模式也能显示数据。
      var hasValidModelData = false;
      if (data.models && data.models.length > 1) {
        hasValidModelData = slicedModels.some(function(sm) {
          return sm.yValue.some(function(v) {
            return v !== '-' && v !== null && v !== undefined && v > 0;
          });
        });
      }

      if (hasValidModelData) {
        legend = {
          show: true,
          top: 0,
          type: 'scroll',
          textStyle: { fontSize: 10, color: c.text },
          itemWidth: 12,
          itemHeight: 8,
          pageIconSize: 10,
          pageTextStyle: { color: c.text }
        };

        if (isLine) {
          var totalSeries = {
            name: loc.total || 'Total',
            type: 'line',
            data: slicedY,
            itemStyle: { color: TOTAL_COLOR },
            connectNulls: false,
            smooth: true,
            symbol: 'none',
            lineStyle: { width: 2, color: TOTAL_COLOR, type: 'solid' },
            areaStyle: { color: 'rgba(99,102,241,0.15)' }
          };
          series.push(totalSeries);
        }

        for (var i = 0; i < slicedModels.length; i++) {
          var m = slicedModels[i];
          var mc = getModelColor(m.model, usedColors);
          usedColors.push(mc);
          var modelSeries = {
            name: m.model,
            type: chartType,
            data: m.yValue,
            itemStyle: { color: mc },
            connectNulls: false
          };
          if (isLine) {
            modelSeries.smooth = true;
            modelSeries.symbol = 'none';
            modelSeries.lineStyle = { width: 1.5, color: mc };
          } else if (isBar) {
            modelSeries.stack = 'total';
          }
          series.push(modelSeries);
        }
      } else {
        var singleSeries = {
          name: metric === 'calls' ? (loc.calls || 'Calls') : (loc.tooltipTokens || 'Tokens'),
          type: chartType,
          data: slicedY,
          connectNulls: false
        };
        if (isLine) {
          singleSeries.smooth = true;
          singleSeries.symbol = 'none';
          singleSeries.lineStyle = { width: 1.5, color: c.accent };
          singleSeries.areaStyle = { color: c.area };
        } else if (isBar) {
          singleSeries.itemStyle = { color: c.accent };
          singleSeries.barWidth = '50%';
        }
        series.push(singleSeries);
      }

      todayChart.setOption({
        grid: { top: hasValidModelData ? 24 : 12, right: 8, bottom: 32, left: 42 },
        legend: legend,
        xAxis: {
          type: 'category',
          data: slicedX,
          boundaryGap: isBar,
        axisLabel: { fontSize: 9, color: c.text, interval: 'auto', rotate: 45 },
        axisLine: { lineStyle: { color: c.grid } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 9, color: c.text, formatter: metric === 'calls' ? function(v) { return v >= 1000 ? (v/1000).toFixed(1)+'K' : v; } : function(v) { return v >= 1000000 ? (v/1000000).toFixed(1)+'M' : v >= 1000 ? (v/1000).toFixed(1)+'K' : v; } },
        splitLine: { lineStyle: { color: c.grid } }
      },
      series: series,
      tooltip: {
        trigger: 'axis',
        textStyle: { fontSize: 10 },
        formatter: function(params) {
            if (!params || params.length === 0) return '';
            var result = params[0].axisValue;
            var hasData = false;
            for (var i = 0; i < params.length; i++) {
              var p = params[i];
              var idx = p.dataIndex;
              var tokenVal, callVal;
              var isTotal = p.seriesName === (loc.total || 'Total');
              var mm = _modelMap[p.seriesName];
              // 单 series 分支：seriesName 既不是 'Total' 也不在 _modelMap 中
              // （如无模型、单模型、或 calls 指标下 per-model 数据无效的 fall back）
              var isSingle = !isTotal && !mm;
              if (isTotal || isSingle) {
                // Total 和单 series 都用汇总数据
                tokenVal = _totalTokens[idx];
                callVal = _totalCalls[idx];
              } else {
                tokenVal = mm.tokens ? mm.tokens[idx] : null;
                callVal = mm.calls ? mm.calls[idx] : null;
              }
              if (tokenVal === null && callVal === null) continue;
              if ((tokenVal === null || tokenVal === '-' || tokenVal === undefined || tokenVal === 0) &&
                  (callVal === null || callVal === '-' || callVal === undefined || callVal === 0)) continue;
              
              hasData = true;
              result += '<br/>' + p.marker + p.seriesName + ': ';
              if (isSingle) {
                // 单 series：根据当前 metric 显示对应字段，与 seriesName (Calls/Tokens) 语义一致
                if (metric === 'calls') {
                  result += (callVal !== null && callVal !== '-' && callVal !== undefined) ? callVal : '--';
                } else {
                  result += (tokenVal !== null && tokenVal !== '-' && tokenVal !== undefined)
                    ? (tokenVal >= 1000000 ? (tokenVal/1000000).toFixed(1)+'M' : tokenVal >= 1000 ? (tokenVal/1000).toFixed(1)+'K' : tokenVal)
                    : '--';
                }
              } else {
                // Total 或模型 series：显示 token，Total 再附加 call
                if (tokenVal !== null && tokenVal !== '-' && tokenVal !== undefined) {
                  result += (tokenVal >= 1000000 ? (tokenVal/1000000).toFixed(1)+'M' : tokenVal >= 1000 ? (tokenVal/1000).toFixed(1)+'K' : tokenVal);
                } else {
                  result += '--';
                }
                if (isTotal) {
                  result += ', ';
                  if (callVal !== null && callVal !== '-' && callVal !== undefined) {
                    result += callVal;
                  } else {
                    result += '--';
                  }
                  result += ' ' + (loc.calls || 'Calls');
                }
              }
            }
            return hasData ? result : '';
          }
        }
      });
    } catch(e) {
      console.error('initTodayChart error:', e);
    }
  }

  function initWeekChart(data, is30Day, metric) {
    const dom = document.getElementById('week-chart');
    if (!dom) return;
    weekChart = reuseChart(weekChart, dom);
    const c = chartColors();
    var usedColors = [];

    metric = metric || 'tokens';
    var mainTokens = data.tokens;
    var mainCalls = data.calls || [];
    var mainData = metric === 'calls' ? mainCalls : mainTokens;

    // Save full data for dual-metric tooltip (closure)
    var _wTokens = mainTokens;
    var _wCalls = mainCalls;
    var _wModelMap = {};
    if (data.models) {
      for (var mi = 0; mi < data.models.length; mi++) {
        var md = data.models[mi];
        _wModelMap[md.model] = { tokens: md.tokens, calls: md.calls || [] };
      }
    }

    var series = [];
    var legend = { show: false };
    
    if (data.models && data.models.length > 1) {
      legend = {
        show: true,
        top: 0,
        type: 'scroll',
        textStyle: { fontSize: 10, color: c.text },
        itemWidth: 12,
        itemHeight: 8,
        pageIconSize: 10,
        pageTextStyle: { color: c.text }
      };
      
      series.push({
        name: loc.total || 'Total',
        type: 'line',
        data: mainData,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: TOTAL_COLOR, type: 'solid' },
        itemStyle: { color: TOTAL_COLOR },
        areaStyle: { color: 'rgba(99,102,241,0.15)' },
        connectNulls: false
      });
      
      for (var i = 0; i < data.models.length; i++) {
        var m = data.models[i];
        var mData = metric === 'calls' ? (m.calls || []) : m.tokens;
        var mc = getModelColor(m.model, usedColors);
        usedColors.push(mc);
        series.push({
          name: m.model,
          type: 'line',
          data: mData,
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 1.5, color: mc },
          itemStyle: { color: mc },
          connectNulls: false
        });
      }
    } else {
      series.push({
        name: metric === 'calls' ? (loc.calls || 'Calls') : (loc.tooltipTokens || 'Tokens'),
        type: 'line',
        data: mainData,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color: c.accent },
        areaStyle: { color: c.area },
        connectNulls: false
      });
    }

    var xLabels = is30Day ? data.dates.map(function(d) { var idx = d.indexOf('\\n'); return idx >= 0 ? d.substring(0, idx) : d; }) : data.dates;
    var tooltipLabels = data.dates;

    weekChart.setOption({
      grid: { top: data.models && data.models.length > 1 ? 24 : 8, right: 8, bottom: 32, left: 42 },
      legend: legend,
      xAxis: {
        type: 'category',
        data: xLabels,
        boundaryGap: false,
        axisLabel: { fontSize: 9, color: c.text, interval: data.dates.length > 10 ? 4 : 0 },
        axisLine: { lineStyle: { color: c.grid } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 9, color: c.text, formatter: metric === 'calls' ? function(v) { return v >= 1000 ? (v/1000).toFixed(1)+'K' : v; } : function(v) { return v >= 1000000 ? (v/1000000).toFixed(1)+'M' : v >= 1000 ? (v/1000).toFixed(1)+'K' : v; } },
        splitLine: { lineStyle: { color: c.grid } }
      },
      series: series,
      tooltip: {
        trigger: 'axis',
        textStyle: { fontSize: 10 },
        formatter: function(params) {
          if (!params || params.length === 0) return '';
          var idx = params[0].dataIndex;
          var result = tooltipLabels[idx];
          var hasData = false;
          for (var i = 0; i < params.length; i++) {
            var p = params[i];
            var tokenVal, callVal;
            if (p.seriesName === (loc.total || 'Total')) {
              tokenVal = _wTokens[idx];
              callVal = _wCalls[idx];
            } else {
              var mm = _wModelMap[p.seriesName];
              if (mm) {
                tokenVal = mm.tokens ? mm.tokens[idx] : null;
                callVal = mm.calls ? mm.calls[idx] : null;
              }
            }
            if (tokenVal === null && callVal === null) continue;
            if ((tokenVal === null || tokenVal === undefined || tokenVal === 0) &&
                (callVal === null || callVal === undefined || callVal === 0)) continue;
            
            hasData = true;
            var isTotal = p.seriesName === (loc.total || 'Total');
            result += '<br/>' + p.marker + p.seriesName + ': ';
            // Token value
            if (tokenVal !== null && tokenVal !== undefined) {
              result += (tokenVal >= 1000000 ? (tokenVal/1000000).toFixed(1)+'M' : tokenVal >= 1000 ? (tokenVal/1000).toFixed(1)+'K' : tokenVal);
            } else {
              result += '--';
            }
            // Call value — only for Total
            if (isTotal) {
              result += ', ';
              if (callVal !== null && callVal !== undefined) {
                result += callVal;
              } else {
                result += '--';
              }
              result += ' ' + (loc.calls || 'Calls');
            }
          }
          return hasData ? result : '';
        }
      }
    });
  }

  function initQuotaChart(hourlyData, weeklyData, dayRange) {
    try {
      const dom = document.getElementById('quota-rate-chart');
      if (!dom) return;
      quotaChart = reuseChart(quotaChart, dom);
      const c = chartColors();

      // Set title and toggle labels
      var rateTitle = document.getElementById('quota-rate-section-title');
      if (rateTitle) rateTitle.textContent = loc.quotaConsumptionRate || 'Quota Consumption';
      var dayTodayBtn = document.getElementById('quota-rate-day-today');
      var dayWeekBtn = document.getElementById('quota-rate-day-week');
      if (dayTodayBtn) dayTodayBtn.textContent = loc.todayLabel || 'Today';
      if (dayWeekBtn) dayWeekBtn.textContent = loc.weekLabel || '7 Days';

      syncQuotaRateDayToggleUI();

      const isToday = dayRange === 'today';

      if (isToday) {
        // ---- Today (hourly) chart: dual y-axis (5h% left, weekly% right) ----
        if (!hourlyData || hourlyData.length === 0) return;
        renderHourlyChart(hourlyData, c);
      } else {
        // ---- Week (daily) chart ----
        if (!weeklyData || weeklyData.length === 0) return;
        renderWeeklyChart(weeklyData, c);
      }
    } catch(e) {
      console.error('initQuotaChart error:', e);
    }
  }

  /** 简化版的 tokens 数字格式化（与 statusBar/formatters.ts 保持一致的视觉风格） */
  function fmtTokensShort(n) {
    if (n === null || n === undefined) return '--';
    if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }

  function renderHourlyChart(data, c) {
    // Fixed x-axis: today's hours with smart trimming for morning/evening ranges
    var dataByLabel = {};
    for (var i = 0; i < data.length; i++) {
      dataByLabel[data[i].label] = data[i];
    }
    function hourHasData(h) {
      var l = (h < 10 ? '0' : '') + h + ':00';
      var d = dataByLabel[l];
      // 0 is treated as "no data" — only positive values count
      return !!d && d.tokens !== null && d.tokens !== undefined && d.tokens > 0;
    }
    var morningHasData = false;
    for (var hm = 0; hm <= 6; hm++) { if (hourHasData(hm)) { morningHasData = true; break; } }
    var eveningHasData = false;
    for (var he = 19; he <= 23; he++) { if (hourHasData(he)) { eveningHasData = true; break; } }
    var startH = morningHasData ? 0 : 7;
    var endH = eveningHasData ? 23 : 18;

    var xData = [];
    var paddedData = [];
    for (var h = startH; h <= endH; h++) {
      var lbl = (h < 10 ? '0' : '') + h + ':00';
      xData.push(lbl);
      paddedData.push(dataByLabel[lbl] || { label: lbl, tokens: null, pctOf5h: null, pctOfWeekly: null });
    }
    // Single series (pctOf5h) with dual y-axis: left = 5h%, right = weekly% (= value / 5)
    const seriesData = paddedData.map(function(d) { return d.pctOf5h; });
    const seriesColor = '#5B9BD5';
    const seriesName = loc.fiveHourRateLabel || '5h %/h';
    const weeklyName = loc.weeklyRateLabel || 'Weekly %/h';
    const quotaLabel5h = loc.ofFiveHourQuota || 'of 5h quota';
    const quotaLabelWeekly = loc.ofWeeklyQuota || 'of weekly quota';

    // Both axes share the same max so ticks align; right axis divides by 5 for weekly%.
    var dataMax = 1;
    for (var di = 0; di < seriesData.length; di++) {
      var v = seriesData[di];
      if (v !== null && v !== undefined && v > dataMax) { dataMax = v; }
    }
    // Round up to a "nice" number with ~10% headroom
    var axisMax = Math.ceil(dataMax * 1.1);

    quotaChart.setOption({
      grid: { top: 20, right: 36, bottom: 32, left: 8 },
      xAxis: {
        type: 'category', data: xData, boundaryGap: true,
        axisLabel: { fontSize: 9, color: c.text, interval: 'auto', rotate: 45 },
        axisLine: { lineStyle: { color: c.grid } },
        axisTick: { show: false }
      },
      yAxis: [
        {
          type: 'value',
          position: 'left',
          axisLabel: { fontSize: 9, color: seriesColor, formatter: function(v) { return v + '%'; } },
          splitLine: { lineStyle: { color: c.grid } },
          min: 0,
          max: axisMax
        },
        {
          type: 'value',
          position: 'right',
          axisLabel: { fontSize: 9, color: '#89D185', formatter: function(v) { return (v / 5).toFixed(1) + '%'; } },
          splitLine: { show: false },
          min: 0,
          max: axisMax
        }
      ],
      series: [{
        name: seriesName, type: 'bar', data: seriesData, yAxisIndex: 0,
        itemStyle: { color: seriesColor, borderRadius: [3, 3, 0, 0] },
        barMaxWidth: 22
      }],
      tooltip: {
        trigger: 'axis', textStyle: { fontSize: 10 },
        formatter: function(params) {
          if (!params || params.length === 0) return '';
          var idx = params[0].dataIndex;
          var d = paddedData[idx];
          var result = d.label;
          var val5h = d.pctOf5h;
          var valWeekly = d.pctOfWeekly;
          var hasData = val5h !== null && val5h !== undefined && val5h > 0;
          if (hasData) {
            result += '<br/><span style="color:' + seriesColor + '">■</span> ' + seriesName + ': +' + val5h.toFixed(2) + '%';
            result += '<br/><span style="color:#89D185">■</span> ' + weeklyName + ': +' + valWeekly.toFixed(2) + '%';
            if (d.tokens !== null && d.tokens !== undefined) {
              result += '<br/>' + (loc.tokens || 'Tokens') + ': ' + fmtTokensShort(d.tokens) + ' (' + quotaLabel5h + ' / ' + quotaLabelWeekly + ')';
            }
          } else {
            result += '<br/>' + (loc.noData || 'No data');
          }
          return result;
        }
      }
    });
  }

  function renderWeeklyChart(data, c) {
    const xData = data.map(function(d) {
      var sub = d.subLabel ? (loc[d.subLabel] || d.subLabel) : '';
      return sub ? (d.label + '\\n' + sub) : d.label;
    });
    const seriesData = data.map(function(d) { return d.pctOfWeekly; });
    const seriesColor = '#89D185';
    const seriesName = loc.dailyRateLabel || 'Weekly %/d';
    const quotaLabel = loc.ofWeeklyQuota || 'of weekly quota';

    quotaChart.setOption({
      grid: { top: 20, right: 36, bottom: 40, left: 8 },
      xAxis: {
        type: 'category', data: xData, boundaryGap: true,
        axisLabel: { fontSize: 9, color: c.text, interval: 0 },
        axisLine: { lineStyle: { color: c.grid } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        position: 'right',
        axisLabel: { fontSize: 9, color: seriesColor, formatter: function(v) { return v + '%'; } },
        splitLine: { lineStyle: { color: c.grid } },
        min: 0
      },
      series: [{
        name: seriesName, type: 'bar', data: seriesData,
        itemStyle: { color: seriesColor, borderRadius: [3, 3, 0, 0] },
        barMaxWidth: 30
      }],
      tooltip: {
        trigger: 'axis', textStyle: { fontSize: 10 },
        formatter: function(params) {
          if (!params || params.length === 0) return '';
          var idx = params[0].dataIndex;
          var d = data[idx];
          var sub = d.subLabel ? (loc[d.subLabel] || d.subLabel) : '';
          var result = d.label + (sub ? ' ' + sub : '');
          if (d.pctOfWeekly !== null && d.pctOfWeekly !== undefined && d.pctOfWeekly > 0) {
            result += '<br/><span style="color:' + seriesColor + '">■</span> ' + seriesName + ': +' + d.pctOfWeekly.toFixed(2) + '%';
            if (d.tokens !== null && d.tokens !== undefined) {
              result += '<br/>' + (loc.tokens || 'Tokens') + ': ' + fmtTokensShort(d.tokens) + ' (' + quotaLabel + ')';
            }
          } else {
            result += '<br/>' + (loc.noData || 'No data');
          }
          return result;
        }
      }
    });
  }

  function updateQuotas(quotas) {
    var section = document.getElementById('quota-section');
    if (!section) return;
    if (!quotas || quotas.length === 0) {
      section.innerHTML = '<div class="no-data">' + esc(loc.noQuotaData || '') + '</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < quotas.length; i++) {
      var q = quotas[i];
      html += '<div class="quota-item">';
      html += '<div class="section-title"><span>' + esc(q.label) + '</span><span class="stat-suffix" style="color:' + q.color + '">' + q.percentage.toFixed(1) + '%</span></div>';
      html += '<div class="quota-bar-outer"><div class="quota-bar-inner" style="width:' + q.percentage + '%;background:' + q.color + '"></div></div>';
      html += '<div class="quota-meta"><span>' + esc(loc.nextReset || 'Next reset') + ': <span class="quota-value">' + esc(q.nextReset) + '</span></span></div>';
      if (q.currentUsage !== undefined && q.total !== undefined) {
        html += '<div class="quota-usage-row">' + esc(loc.usage || 'Usage') + ': <span class="quota-value">' + q.currentUsage + ' / ' + q.total + '</span>, ' + esc(loc.remaining || 'Remaining') + ': <span class="quota-value">' + (q.remaining ?? (q.total - (q.currentUsage || 0))) + '</span></div>';
      }
      if (q.estimate) {
        var estimateParts = q.estimate.split(': ');
        if (estimateParts.length === 2) {
          html += '<div class="quota-estimate">' + esc(estimateParts[0]) + ': <span class="quota-value">' + esc(estimateParts[1]) + '</span></div>';
        } else {
          html += '<div class="quota-estimate">' + esc(q.estimate) + '</div>';
        }
      }
      if (q.timeToExhaust) {
        var exhaustParts = q.timeToExhaust.split(': ');
        if (exhaustParts.length === 2) {
          html += '<div class="quota-estimate">' + esc(exhaustParts[0]) + ': <span class="quota-value">' + esc(exhaustParts[1]) + '</span></div>';
        } else {
          html += '<div class="quota-estimate">' + esc(q.timeToExhaust) + '</div>';
        }
      }
      html += '</div>';
    }
    section.innerHTML = html;
  }

  function esc(s) {
    if (!s) return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // 7/30 天切换是静态结构，只在首次构建一次；后续仅同步激活态，避免每次刷新重建 innerHTML
  var dayRangeToggleBuilt = false;
  function ensureDayRangeToggle() {
    if (dayRangeToggleBuilt) return;
    var sel = document.getElementById('day-range-select');
    if (!sel) return;
    sel.innerHTML = '<span class="radio-link" data-value="7">' + (loc.last7Days || '7 Days') + '</span><span class="radio-link" data-value="30">' + (loc.last30Days || '30 Days') + '</span>';
    dayRangeToggleBuilt = true;
  }
  function syncDayRangeUI() {
    var btns = document.querySelectorAll('#day-range-select .radio-link');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].dataset.value === currentRange);
    }
  }

  function updateUI(data) {
    loc = data.locales || {};

    document.getElementById('no-data').style.display = 'none';

    document.getElementById('header-title').textContent = loc.title || 'Coding Plan Usage';
    // 合并当前平台 adapter 提供的模型色表（覆盖默认回退色）
    if (data.modelColors) {
      for (var mk in data.modelColors) {
        if (Object.prototype.hasOwnProperty.call(data.modelColors, mk)) {
          KNOWN_MODEL_COLORS[mk] = data.modelColors[mk];
        }
      }
    }
    document.getElementById('header-updated').textContent = (loc.updated || 'Updated') + ': ' + (data.updated || '');
    document.getElementById('refresh-btn').title = loc.refresh || 'Refresh';
    document.getElementById('settings-label').textContent = loc.settings || 'Settings';
    document.getElementById('apikey-label').textContent = loc.configureApiKey || 'Configure API Key';

    // Set metric toggle labels from locale
    var todayTokensBtn = document.getElementById('today-metric-tokens');
    var todayCallsBtn = document.getElementById('today-metric-calls');
    if (todayTokensBtn) todayTokensBtn.textContent = loc.tokens || 'Tokens';
    if (todayCallsBtn) todayCallsBtn.textContent = loc.calls || 'Calls';
    var weekTokensBtn = document.getElementById('week-metric-tokens');
    var weekCallsBtn = document.getElementById('week-metric-calls');
    if (weekTokensBtn) weekTokensBtn.textContent = loc.tokens || 'Tokens';
    if (weekCallsBtn) weekCallsBtn.textContent = loc.calls || 'Calls';
    var barBtn = document.getElementById('today-chart-bar');
    var lineBtn = document.getElementById('today-chart-line');
    if (barBtn) barBtn.textContent = loc.barChart || 'Bar';
    if (lineBtn) lineBtn.textContent = loc.lineChart || 'Line';
    syncMetricToggleUI();
    syncTodayChartTypeUI();

    updateQuotas(data.quotas);

    var quotaRateSection = document.getElementById('quota-rate-section');
    quotaData = (data.quotaRate && data.quotaRate.hourly) || [];
    weeklyQuotaData = (data.quotaRate && data.quotaRate.daily) || [];
    if ((quotaData.length > 0) || (weeklyQuotaData.length > 0)) {
      quotaRateSection.style.display = '';
      initQuotaChart(quotaData, weeklyQuotaData, currentQuotaDayRange);
    } else {
      quotaRateSection.style.display = 'none';
    }

    var todaySection = document.getElementById('today-section');
    if (data.today) {
      todaySection.style.display = '';
      document.getElementById('today-section-title').textContent = loc.todayUsage || 'Today Usage';
      document.getElementById('today-tokens-label').textContent = loc.tokens || 'Tokens';
      document.getElementById('today-calls-label').textContent = loc.calls || 'Calls';
      document.getElementById('today-tokens').textContent = data.today.totalTokens;
      document.getElementById('today-calls').textContent = data.today.totalCalls;
      // 等价 API 花费（基于今日 token，显示在「词元」下方）
      var todayCostRow = document.getElementById('today-cost-row');
      var ec = data.estimatedCost;
      if (todayCostRow && ec && ec.totalCny > 0) {
        document.getElementById('today-cost-label').textContent = loc.estimatedCostLabel || 'Equivalent API cost (estimated)';
        todayCostRow.title = loc.estimatedCostHint || '';
        document.getElementById('today-cost').textContent = ec.totalCny.toFixed(2);
        var bk = document.getElementById('today-cost-breakdown');
        if (bk) {
          bk.textContent = (ec.perModel && ec.perModel.length > 0)
            ? ec.perModel.slice(0, 3).map(function (m) { return m.model + ': ¥' + m.costCny.toFixed(2); }).join(' · ') + (ec.hasFallback ? ' · ⚠️' : '')
            : '';
        }
        todayCostRow.style.display = '';
      } else if (todayCostRow) {
        todayCostRow.style.display = 'none';
      }
      initTodayChart(data.today, currentMetric, currentChartType);
    } else {
      todaySection.style.display = 'none';
    }

    var weekSection = document.getElementById('week-section');
    if (data.week || data.month) {
      weekSection.style.display = '';
      storedData = data;
      ensureDayRangeToggle();
      syncDayRangeUI();
      renderDailyChart();
    } else {
      weekSection.style.display = 'none';
      storedData = null;
    }
  }

  function renderDailyChart() {
    if (!storedData) return;
    var d = currentRange === '30' ? storedData.month : storedData.week;
    if (!d) { d = storedData.week || storedData.month; }
    if (!d) return;
    document.getElementById('week-section-title').textContent = loc.dailyUsage || 'Daily Usage';
    document.getElementById('week-total').textContent = (loc.tokens || 'Tokens') + ': ' + d.total;
    if (d.totalCalls) {
      document.getElementById('week-total-calls').textContent = (loc.calls || 'Calls') + ': ' + d.totalCalls;
    } else {
      document.getElementById('week-total-calls').textContent = '';
    }
    initWeekChart(d, currentRange === '30', currentMetric);
  }

  function syncMetricToggleUI() {
    var allLinks = document.querySelectorAll('#today-metric-select .radio-link, #week-metric-select .radio-link');
    for (var i = 0; i < allLinks.length; i++) {
      var link = allLinks[i];
      if (link.dataset.value === currentMetric) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    }
  }

  function onMetricToggle(metric) {
    if (metric === currentMetric) return;
    currentMetric = metric;
    syncMetricToggleUI();
    // Re-render today chart if data available
    if (storedData && storedData.today) {
      initTodayChart(storedData.today, currentMetric, currentChartType);
    }
    // Re-render week chart if data available
    renderDailyChart();
  }

  function syncTodayChartTypeUI() {
    var allLinks = document.querySelectorAll('#today-chart-type-select .radio-link');
    for (var i = 0; i < allLinks.length; i++) {
      var link = allLinks[i];
      if (link.dataset.value === currentChartType) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    }
  }

  function onTodayChartTypeToggle(chartType) {
    if (chartType === currentChartType) return;
    currentChartType = chartType;
    syncTodayChartTypeUI();
    vscodeApi.postMessage({ command: 'saveTodayChartType', value: chartType });
    if (storedData && storedData.today) {
      initTodayChart(storedData.today, currentMetric, currentChartType);
    }
  }

  // Metric toggle click handler (event delegation on both toggle groups)
  function addMetricToggleHandler(selector) {
    var el = document.getElementById(selector);
    if (!el) return;
    el.addEventListener('click', function(e) {
      var btn = e.target.closest('.radio-link');
      if (!btn) return;
      onMetricToggle(btn.dataset.value);
    });
  }
  addMetricToggleHandler('today-metric-select');
  addMetricToggleHandler('week-metric-select');

  function addTodayChartTypeToggleHandler() {
    var el = document.getElementById('today-chart-type-select');
    if (!el) return;
    el.addEventListener('click', function(e) {
      var btn = e.target.closest('.radio-link');
      if (!btn) return;
      onTodayChartTypeToggle(btn.dataset.value);
    });
  }
  addTodayChartTypeToggleHandler();

  function syncQuotaRateDayToggleUI() {
    var allLinks = document.querySelectorAll('#quota-rate-day-toggle .radio-link');
    for (var i = 0; i < allLinks.length; i++) {
      var link = allLinks[i];
      if (link.dataset.value === currentQuotaDayRange) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    }
  }

  function onQuotaRateDayToggle(dayRange) {
    if (dayRange === currentQuotaDayRange) return;
    currentQuotaDayRange = dayRange;
    vscodeApi.postMessage({ command: 'saveQuotaRateDayRange', value: dayRange });
    initQuotaChart(quotaData, weeklyQuotaData, currentQuotaDayRange);
  }

  function addQuotaRateDayToggleHandler() {
    var el = document.getElementById('quota-rate-day-toggle');
    if (!el) return;
    el.addEventListener('click', function(e) {
      var btn = e.target.closest('.radio-link');
      if (!btn) return;
      onQuotaRateDayToggle(btn.dataset.value);
    });
  }
  addQuotaRateDayToggleHandler();

  window.doRefresh = function() {
    showLoading(loc.loading || 'Loading...');
    vscodeApi.postMessage({ command: 'refresh' });
  };

  // 用 addEventListener 绑定（CSP 下禁用内联 onclick）
  var refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn && window.doRefresh) { refreshBtn.addEventListener('click', window.doRefresh); }

  document.getElementById('settings-btn').addEventListener('click', function() {
    vscodeApi.postMessage({ command: 'openSettings' });
  });

  document.getElementById('apikey-btn').addEventListener('click', function() {
    vscodeApi.postMessage({ command: 'setToken' });
  });

  document.getElementById('day-range-select').addEventListener('click', function(e) {
    var btn = e.target.closest('.radio-link');
    if (!btn) return;
    currentRange = btn.dataset.value;
    var btns = document.querySelectorAll('#day-range-select .radio-link');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].dataset.value === currentRange);
    }
    vscodeApi.postMessage({ command: 'saveRange', value: currentRange });
    renderDailyChart();
  });

  window.addEventListener('message', function(event) {
    var msg = event.data;
    if (msg && msg.command === 'updateData') {
      hideLoading();
      document.getElementById('error-section').style.display = 'none';
      document.getElementById('quota-section').style.display = '';
      document.getElementById('today-section').style.display = '';
      document.getElementById('week-section').style.display = '';
      if (msg.dayRange) {
        currentRange = msg.dayRange;
      }
      if (msg.quotaRateDayRange) {
        currentQuotaDayRange = msg.quotaRateDayRange;
      }
      if (msg.todayChartType) {
        currentChartType = msg.todayChartType;
      }
      updateUI(msg.data);
    } else if (msg && msg.command === 'showError') {
      hideLoading();
      document.getElementById('error-section').style.display = '';
      document.getElementById('quota-section').style.display = 'none';
      document.getElementById('today-section').style.display = 'none';
      document.getElementById('week-section').style.display = 'none';
      document.getElementById('no-data').style.display = 'none';
      document.getElementById('quota-rate-section').style.display = 'none';
      document.getElementById('error-message').textContent = msg.error;
    } else if (msg && msg.command === 'loading') {
      showLoading(loc.loading || 'Loading...');
    }
  });

  // 用 requestAnimationFrame 合并连续的 resize 回调：拖拽面板时会高频触发，
  // 合并后每帧最多 resize 一次，避免对三个图表反复重排重绘造成的 CPU 峰值。
  var resizeRaf = null;
  function scheduleResize() {
    if (resizeRaf !== null) { return; }
    resizeRaf = requestAnimationFrame(function () {
      resizeRaf = null;
      if (todayChart) { todayChart.resize(); }
      if (quotaChart) { quotaChart.resize(); }
      if (weekChart) { weekChart.resize(); }
    });
  }
  var observer = new ResizeObserver(scheduleResize);
  var tc = document.getElementById('today-chart');
  var qc = document.getElementById('quota-rate-chart');
  var wc = document.getElementById('week-chart');
  if (tc) observer.observe(tc);
  if (qc) observer.observe(qc);
  if (wc) observer.observe(wc);

  vscodeApi.postMessage({ command: 'ready' });
})();
</script>
</body>
</html>`;
}
