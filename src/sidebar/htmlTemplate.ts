import * as vscode from 'vscode';

export function getHtmlTemplate(echartsUri: vscode.Uri): string {
    const echartsSrc = echartsUri.toString();

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  padding: 12px 8px;
  font-family: var(--vscode-editor-font-family, -apple-system, sans-serif);
  font-size: 12px;
  color: var(--vscode-editor-foreground);
  background: var(--vscode-editor-background);
  user-select: none;
  position: relative;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.header .title {
  font-size: 15px;
  font-weight: 600;
}
.header .updated {
  font-size: 10px;
  color: var(--vscode-descriptionForeground);
}
.section {
  margin-bottom: 16px;
  border-top: 1px solid var(--vscode-panel-border);
  padding-top: 16px;
}
.section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--vscode-textLink-foreground);
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
  gap: 8px;
  margin-top: 2px;
}
.section-title-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.quota-item {
  margin-bottom: 10px;
}
.quota-item + .quota-item {
  border-top: 1px solid var(--vscode-panel-border);
  padding-top: 10px;
}
.quota-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3px;
  font-size: 11px;
}
.quota-pct {
  font-weight: 600;
  font-size: 12px;
}
.quota-bar-outer {
  height: 6px;
  background: var(--vscode-editorWidget-border, var(--vscode-panel-border));
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 3px;
}
.quota-bar-inner {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}
.quota-meta {
  font-size: 12px;
  color: var(--vscode-editor-foreground);
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  line-height: 1.6;
}
.quota-estimate {
  font-size: 12px;
  color: var(--vscode-editor-foreground);
  margin-top: 2px;
  line-height: 1.6;
}
.quota-usage-row {
  font-size: 12px;
  color: var(--vscode-editor-foreground);
  margin-top: 2px;
  line-height: 1.6;
}
.quota-value {
  color: var(--vscode-descriptionForeground);
}
.chart-container {
  width: 100%;
  height: 160px;
}
.stat-suffix {
  font-size: 12px;
  color: var(--vscode-descriptionForeground);
  font-weight: 600;
}
.no-data {
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
  font-style: italic;
  padding: 8px 0;
  text-align: center;
}
.refresh-btn {
  background: none;
  border: 1px solid var(--vscode-panel-border);
  color: var(--vscode-editor-foreground);
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.refresh-btn:hover {
  background: var(--vscode-toolbar-hoverBackground);
}
.refresh-btn:active {
  background: var(--vscode-toolbar-activeBackground);
}
.radio-link-group {
  display: inline-flex;
  border: 1px solid var(--vscode-panel-border);
  border-radius: 4px;
  overflow: hidden;
}
.radio-link {
  font-size: 10px;
  padding: 2px 8px;
  color: var(--vscode-editor-foreground);
  cursor: pointer;
  background: var(--vscode-input-background);
  border-right: 1px solid var(--vscode-panel-border);
}
.radio-link:last-child {
  border-right: none;
}
.radio-link:hover {
  background: var(--vscode-toolbar-hoverBackground);
}
.radio-link.active {
  background: var(--vscode-textLink-foreground);
  color: var(--vscode-editor-background);
  font-weight: 600;
  cursor: default;
}
.action-bar {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--vscode-panel-border);
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--vscode-textLink-foreground);
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}
.action-btn:hover {
  text-decoration: underline;
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
  background: rgba(var(--vscode-editor-background-rgb, 30,30,30), 0.6);
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
</style>
</head>
<body>
<div class="loading-overlay" id="loading-overlay">
  <div class="loading-spinner"></div>
  <div class="loading-text" id="loading-text">Loading...</div>
</div>
<div class="header">
  <span class="title" id="header-title">GLM Coding Plan Usage</span>
  <button class="refresh-btn" id="refresh-btn" onclick="doRefresh()">&#x21bb;</button>
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
        <span class="radio-link-group" id="quota-rate-metric-select">
          <span id="quota-rate-metric-5h" class="radio-link active" data-value="5h">5h</span>
          <span id="quota-rate-metric-weekly" class="radio-link" data-value="weekly">周</span>
        </span>
        <span class="radio-link-group" id="quota-rate-day-toggle">
          <span class="radio-link active" data-value="today">当天</span>
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

<script src="${echartsSrc}"></script>
<script>
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
  let currentQuotaRate = '5h';
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

  function initTodayChart(data, metric, chartType) {
    try {
      const dom = document.getElementById('today-chart');
      if (!dom) return;
      if (todayChart) todayChart.dispose();
      todayChart = echarts.init(dom);
      const c = chartColors();
      var usedColors = [];

      const xData = data.xTime.map(function(t) {
        const parts = t.split(' ');
        return parts.length >= 2 ? parts[1].substring(0, 2) + ':00' : t;
      });
      metric = metric || 'tokens';
      var mainData = metric === 'calls' ? (data.callCount || []) : data.yValue;
      var yData = mainData.map(function(v) { return v === null ? '-' : v; });

      var startIdx = 0;
      for (var si = 0; si < yData.length; si++) {
        if (yData[si] !== '-' && yData[si] !== 0) { startIdx = si; break; }
      }
      var slicedX = xData.slice(startIdx);
      var slicedY = yData.slice(startIdx);

      // Pad x-axis to at least 6 labels when data is sparse
      var MIN_X_LABELS = 7;
      if (slicedX.length > 0 && slicedX.length < MIN_X_LABELS) {
        var padHours = [];
        for (var pi = 0; pi < slicedX.length; pi++) {
          padHours.push(parseInt(slicedX[pi], 10));
        }
        var padMin = Math.min.apply(null, padHours);
        var padMax = Math.max.apply(null, padHours);
        var padRange = padMax - padMin + 1;
        var padTotal = Math.max(MIN_X_LABELS, padRange);
        var padBefore = Math.floor((padTotal - padRange) / 2);
        var padAfter = padTotal - padRange - padBefore;
        var padStart = padMin - padBefore;
        var padEnd = padMax + padAfter;
        if (padStart < 0) { padEnd += (0 - padStart); padStart = 0; }
        if (padEnd > 23) { padStart -= (padEnd - 23); padEnd = 23; if (padStart < 0) padStart = 0; }

        var origLookup = {};
        for (var oi = 0; oi < slicedX.length; oi++) {
          origLookup[slicedX[oi]] = oi;
        }

        var newX = [], newY = [];
        for (var h = padStart; h <= padEnd; h++) {
          var lbl = (h < 10 ? '0' : '') + h + ':00';
          newX.push(lbl);
          var oi2 = origLookup[lbl];
          newY.push(oi2 !== undefined ? slicedY[oi2] : '-');
        }
        slicedX = newX;
        slicedY = newY;
      }

      var slicedModels = [];

      // Map padded slicedX labels back to original xData indices
      var paddedOrigIdx = {};
      for (var pi2 = 0; pi2 < slicedX.length; pi2++) {
        var lbl2 = slicedX[pi2];
        var found = -1;
        for (var xi = startIdx; xi < xData.length; xi++) {
          if (xData[xi] === lbl2) { found = xi; break; }
        }
        paddedOrigIdx[pi2] = found; // -1 if padded gap
      }

      // Save full data for dual-metric tooltip (closure) — padded
      var allTokens = data.yValue;
      var allCalls = data.callCount || [];
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
        grid: { top: data.models && data.models.length > 1 ? 24 : 12, right: 8, bottom: 32, left: 42 },
        legend: legend,
        xAxis: {
          type: 'category',
          data: slicedX,
          boundaryGap: isBar,
          axisLabel: { fontSize: 9, color: c.text, interval: 0, rotate: 45 },
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
              if (p.seriesName === (loc.total || 'Total')) {
                tokenVal = _totalTokens[idx];
                callVal = _totalCalls[idx];
              } else {
                var mm = _modelMap[p.seriesName];
                if (mm) {
                  tokenVal = mm.tokens ? mm.tokens[idx] : null;
                  callVal = mm.calls ? mm.calls[idx] : null;
                }
              }
              if (tokenVal === null && callVal === null) continue;
              if ((tokenVal === null || tokenVal === '-' || tokenVal === undefined || tokenVal === 0) &&
                  (callVal === null || callVal === '-' || callVal === undefined || callVal === 0)) continue;
              
              hasData = true;
              var isTotal = p.seriesName === (loc.total || 'Total');
              result += '<br/>' + p.marker + p.seriesName + ': ';
              // Token value
              if (tokenVal !== null && tokenVal !== '-' && tokenVal !== undefined) {
                result += (tokenVal >= 1000000 ? (tokenVal/1000000).toFixed(1)+'M' : tokenVal >= 1000 ? (tokenVal/1000).toFixed(1)+'K' : tokenVal);
              } else {
                result += '--';
              }
              // Call value — only for Total
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
    if (weekChart) weekChart.dispose();
    weekChart = echarts.init(dom);
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

  function initQuotaChart(hourlyData, weeklyData, dayRange, metric) {
    try {
      const dom = document.getElementById('quota-rate-chart');
      if (!dom) return;
      if (quotaChart) quotaChart.dispose();
      quotaChart = echarts.init(dom);
      const c = chartColors();

      // Set title and toggle labels
      var rateTitle = document.getElementById('quota-rate-section-title');
      if (rateTitle) rateTitle.textContent = loc.quotaConsumptionRate || 'Quota Consumption Rate';
      var rate5hBtn = document.getElementById('quota-rate-metric-5h');
      var rateWeeklyBtn = document.getElementById('quota-rate-metric-weekly');
      if (rate5hBtn) rate5hBtn.textContent = loc.fiveHourDeltaLabel || '5h Δ';
      if (rateWeeklyBtn) rateWeeklyBtn.textContent = loc.weeklyDeltaLabel || '周 Δ';
      var dayTodayBtn = document.getElementById('quota-rate-day-today');
      var dayWeekBtn = document.getElementById('quota-rate-day-week');
      if (dayTodayBtn) dayTodayBtn.textContent = loc.todayLabel || 'Today';
      if (dayWeekBtn) dayWeekBtn.textContent = loc.weekLabel || '7 Days';

      syncQuotaRateDayToggleUI();
      syncQuotaRateToggleUI();

      // Show/hide metric toggle based on day range
      var metricSelectEl = document.getElementById('quota-rate-metric-select');
      if (metricSelectEl) {
        metricSelectEl.style.display = dayRange === 'today' ? '' : 'none';
      }

      const isToday = dayRange === 'today';

      if (isToday) {
        // ---- Today (hourly) chart ----
        if (!hourlyData || hourlyData.length === 0) return;
        renderHourlyChart(hourlyData, metric, c);
      } else {
        // ---- Week (daily) chart ----
        if (!weeklyData || weeklyData.length === 0) return;
        renderWeeklyChart(weeklyData, c);
      }
    } catch(e) {
      console.error('initQuotaChart error:', e);
    }
  }

  function renderHourlyChart(data, metric, c) {
    const xData = data.map(function(d) { return d.hour; });
    const is5h = metric === '5h';
    const seriesData = is5h
      ? data.map(function(d) { return d.fiveHourDelta; })
      : data.map(function(d) { return d.weeklyDelta; });
    const seriesColor = is5h ? '#5B9BD5' : '#89D185';
    const barWidth = is5h ? 22 : 14;
    const seriesName = is5h
      ? (loc.fiveHourDeltaLabel || '5h')
      : (loc.weeklyDeltaLabel || '周');

    quotaChart.setOption({
      grid: { top: 20, right: 8, bottom: 32, left: 8 },
      xAxis: {
        type: 'category', data: xData, boundaryGap: true,
        axisLabel: { fontSize: 9, color: c.text, interval: 0, rotate: 45 },
        axisLine: { lineStyle: { color: c.grid } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 9, color: c.text },
        splitLine: { lineStyle: { color: c.grid } },
        min: 0
      },
      series: [{
        name: seriesName, type: 'bar', data: seriesData,
        itemStyle: { color: seriesColor, borderRadius: [3, 3, 0, 0] },
        barMaxWidth: barWidth
      }],
      tooltip: {
        trigger: 'axis', textStyle: { fontSize: 10 },
        formatter: function(params) {
          if (!params || params.length === 0) return '';
          var idx = params[0].dataIndex;
          var d = data[idx];
          var result = d.hour;
          if (d.isReset) {
            result += '<br/>' + (loc.quotaResetDetected || '🔄 Quota reset detected');
            return result;
          }
          var val = is5h ? d.fiveHourDelta : d.weeklyDelta;
          var hasData = val !== null && val !== undefined;
          if (hasData) {
            var gapInfo = '';
            if (d.hasGap && d.gapDuration) {
              var gapMsg = (loc.dataGap || 'Data gap ({0}h)').replace('{0}', String(d.gapDuration));
              gapInfo = ' (' + gapMsg + ')';
            }
            result += '<br/><span style="color:' + seriesColor + '">■</span> ' + seriesName + ': ' + (val > 0 ? '+' : '') + val.toFixed(is5h ? 1 : 2) + '%' + gapInfo;
          } else {
            result += '<br/>' + (loc.noDataAvailable || 'No data');
          }
          return result;
        }
      }
    });
  }

  function renderWeeklyChart(data, c) {
    const xData = data.map(function(d) { return d.date + '\\n' + (loc[d.weekday] || d.weekday); });
    const seriesData = data.map(function(d) { return d.weeklyDelta; });
    const seriesColor = '#89D185';
    const seriesName = loc.dailyDeltaLabel || 'Weekly Δ/d';

    quotaChart.setOption({
      grid: { top: 20, right: 8, bottom: 40, left: 8 },
      xAxis: {
        type: 'category', data: xData, boundaryGap: true,
        axisLabel: { fontSize: 9, color: c.text, interval: 0 },
        axisLine: { lineStyle: { color: c.grid } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 9, color: c.text },
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
          var result = d.date + ' ' + (loc[d.weekday] || d.weekday);
          if (d.weeklyDelta !== null && d.weeklyDelta !== undefined) {
            result += '<br/><span style="color:' + seriesColor + '">■</span> ' + seriesName + ': ' + (d.weeklyDelta > 0 ? '+' : '') + d.weeklyDelta.toFixed(1) + '%';
          } else {
            result += '<br/>' + (loc.noDataAvailable || 'No data');
          }
          if (d.weeklyPct !== null) {
            result += '<br/>' + (loc.weeklyQuota || 'Weekly') + ': ' + d.weeklyPct.toFixed(1) + '%';
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

  function updateUI(data) {
    loc = data.locales || {};

    document.getElementById('no-data').style.display = 'none';

    document.getElementById('header-title').textContent = loc.title || 'GLM Coding Plan Usage';
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
    quotaData = data.hourlyQuota || [];
    weeklyQuotaData = data.weeklyQuota || [];
    if ((quotaData.length > 0) || (weeklyQuotaData.length > 0)) {
      quotaRateSection.style.display = '';
      initQuotaChart(quotaData, weeklyQuotaData, currentQuotaDayRange, currentQuotaRate);
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
      initTodayChart(data.today, currentMetric, currentChartType);
    } else {
      todaySection.style.display = 'none';
    }

    var weekSection = document.getElementById('week-section');
    if (data.week || data.month) {
      weekSection.style.display = '';
      storedData = data;
      var sel = document.getElementById('day-range-select');
      sel.innerHTML = '<span class="radio-link' + (currentRange === '7' ? ' active' : '') + '" data-value="7">' + (loc.last7Days || '7 Days') + '</span><span class="radio-link' + (currentRange === '30' ? ' active' : '') + '" data-value="30">' + (loc.last30Days || '30 Days') + '</span>';
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

  function syncQuotaRateToggleUI() {
    var allLinks = document.querySelectorAll('#quota-rate-metric-select .radio-link');
    for (var i = 0; i < allLinks.length; i++) {
      var link = allLinks[i];
      if (link.dataset.value === currentQuotaRate) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    }
  }

  function onQuotaRateToggle(metric) {
    if (metric === currentQuotaRate) return;
    currentQuotaRate = metric;
    syncQuotaRateToggleUI();
    vscodeApi.postMessage({ command: 'saveQuotaRate', value: metric });
    if (quotaData.length > 0) {
      initQuotaChart(quotaData, weeklyQuotaData, currentQuotaDayRange, currentQuotaRate);
    }
  }

  function addQuotaRateToggleHandler() {
    var el = document.getElementById('quota-rate-metric-select');
    if (!el) return;
    el.addEventListener('click', function(e) {
      var btn = e.target.closest('.radio-link');
      if (!btn) return;
      onQuotaRateToggle(btn.dataset.value);
    });
  }
  addQuotaRateToggleHandler();

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
    initQuotaChart(quotaData, weeklyQuotaData, currentQuotaDayRange, currentQuotaRate);
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
      if (msg.quotaRateMetric) {
        currentQuotaRate = msg.quotaRateMetric;
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

  var observer = new ResizeObserver(function() {
    if (todayChart) todayChart.resize();
    if (quotaChart) quotaChart.resize();
    if (weekChart) weekChart.resize();
  });
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
