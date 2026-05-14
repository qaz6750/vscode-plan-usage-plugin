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
  align-items: center;
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
  margin-left: 8px;
  font-weight: 600;
}
.no-data {
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
  font-style: italic;
  padding: 8px 0;
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
  margin-left: 8px;
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
.action-btn svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}
</style>
</head>
<body>
<div class="header">
  <span class="title" id="header-title">GLM Coding Plan Usage</span>
  <button class="refresh-btn" id="refresh-btn" onclick="doRefresh()">&#x21bb;</button>
</div>
<div class="updated" id="header-updated" style="margin-bottom:10px;font-size:10px;color:var(--vscode-descriptionForeground)"></div>

<div class="section" id="quota-section"></div>

<div class="section" id="today-section" style="display:none">
  <div class="section-title">
    <span id="today-section-title"></span>
    <span class="stat-suffix" id="today-tokens-wrap"><span id="today-tokens-label"></span>: <span id="today-tokens">--</span></span>
    <span class="stat-suffix" id="today-calls-wrap"><span id="today-calls-label"></span>: <span id="today-calls">--</span></span>
  </div>
  <div id="today-chart" class="chart-container"></div>
</div>

<div class="section" id="week-section" style="display:none">
  <div class="section-title">
    <span id="week-section-title"></span>
    <span class="stat-suffix" id="week-total"></span>
    <span class="radio-link-group" id="day-range-select"></span>
  </div>
  <div id="week-chart" class="chart-container" style="height:200px"></div>
</div>

<div class="no-data" id="no-data"></div>

<div class="action-bar">
  <button class="action-btn" id="settings-btn">
    <svg viewBox="0 0 16 16"><path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 01-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 01.872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 012.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 012.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 01.872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 01-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 01-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 110-5.86 2.929 2.929 0 010 5.858z"/></svg>
    <span id="settings-label">Settings</span>
  </button>
  <button class="action-btn" id="apikey-btn">
    <svg viewBox="0 0 16 16"><path d="M12.5 0a3.5 3.5 0 00-2.45 5.96L8 8l-1.5 1.5-1-1-1 1 2 2 1-1L9.5 11l2.05-2.04A3.5 3.5 0 0012.5 0zm0 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/></svg>
    <span id="apikey-label">Configure API Key</span>
  </button>
</div>

<script src="${echartsSrc}"></script>
<script>
(function() {
  const vscodeApi = acquireVsCodeApi();
  let todayChart = null;
  let weekChart = null;
  let loc = {};
  let storedData = null;
  let currentRange = '7';

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
    return ['#f38441', '#b86fe5', '#00c9a7', '#ff6b6b', '#4ecdc4', '#ffd93d', '#6c5ce7', '#a8e6cf'];
  }

  function initTodayChart(data) {
    try {
      const dom = document.getElementById('today-chart');
      if (!dom) return;
      if (todayChart) todayChart.dispose();
      todayChart = echarts.init(dom);
      const c = chartColors();

      const xData = data.xTime.map(function(t) {
        const parts = t.split(' ');
        return parts.length >= 2 ? parts[1].substring(0, 2) : t;
      });
      const yData = data.yValue.map(function(v) { return v === null ? '-' : v; });

      var seriesConfig = {
          type: 'line',
          data: yData,
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 1.5, color: c.accent },
          areaStyle: { color: c.area },
          connectNulls: false
      };
      todayChart.setOption({
        grid: { top: 12, right: 8, bottom: 20, left: 42 },
        xAxis: {
          type: 'category',
          data: xData,
          axisLabel: { fontSize: 9, color: c.text, interval: 0 },
          axisLine: { lineStyle: { color: c.grid } },
          axisTick: { show: false }
        },
        yAxis: {
          type: 'value',
          axisLabel: { fontSize: 9, color: c.text, formatter: function(v) { return v >= 1000000 ? (v/1000000).toFixed(1)+'M' : v >= 1000 ? (v/1000).toFixed(1)+'K' : v; } },
          splitLine: { lineStyle: { color: c.grid } }
        },
        series: [seriesConfig],
        tooltip: {
          trigger: 'axis',
          textStyle: { fontSize: 10 },
          formatter: function(params) {
            var p = params[0];
            if (!p || p.value === '-') return '';
            return p.axisValue + '<br/>' + (loc.tooltipTokens || 'Tokens') + ': ' + (p.value >= 1000000 ? (p.value/1000000).toFixed(1)+'M' : p.value >= 1000 ? (p.value/1000).toFixed(1)+'K' : p.value);
          }
        }
      });
    } catch(e) {
      console.error('initTodayChart error:', e);
    }
  }

  function initWeekChart(data) {
    const dom = document.getElementById('week-chart');
    if (!dom) return;
    if (weekChart) weekChart.dispose();
    weekChart = echarts.init(dom);
    const c = chartColors();
    const colors = modelColors();

    var series = [];
    var legend = { show: false };
    
    if (data.models && data.models.length > 0) {
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
        data: data.tokens,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#5985f5', type: 'solid' },
        itemStyle: { color: '#5985f5' },
        areaStyle: { color: 'rgba(89,133,245,0.15)' },
        connectNulls: false
      });
      
      for (var i = 0; i < data.models.length; i++) {
        var m = data.models[i];
        series.push({
          name: m.model,
          type: 'line',
          data: m.tokens,
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 1.5, color: colors[i % colors.length] },
          itemStyle: { color: colors[i % colors.length] },
          connectNulls: false
        });
      }
    } else {
      series.push({
        name: loc.tooltipTokens || 'Tokens',
        type: 'line',
        data: data.tokens,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color: c.accent },
        areaStyle: { color: c.area },
        connectNulls: false
      });
    }

    weekChart.setOption({
      grid: { top: data.models && data.models.length > 0 ? 24 : 8, right: 8, bottom: 32, left: 42 },
      legend: legend,
      xAxis: {
        type: 'category',
        data: data.dates,
        boundaryGap: false,
        axisLabel: { fontSize: 9, color: c.text, interval: data.dates.length > 10 ? 4 : 0 },
        axisLine: { lineStyle: { color: c.grid } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 9, color: c.text, formatter: function(v) { return v >= 1000000 ? (v/1000000).toFixed(1)+'M' : v >= 1000 ? (v/1000).toFixed(1)+'K' : v; } },
        splitLine: { lineStyle: { color: c.grid } }
      },
      series: series,
      tooltip: {
        trigger: 'axis',
        textStyle: { fontSize: 10 },
        formatter: function(params) {
          if (!params || params.length === 0) return '';
          var result = params[0].axisValue;
          
          for (var i = 0; i < params.length; i++) {
            var p = params[i];
            if (p.value === 0 || p.value === null) continue;
            var val = p.value >= 1000000 ? (p.value/1000000).toFixed(1)+'M' : p.value >= 1000 ? (p.value/1000).toFixed(1)+'K' : p.value;
            result += '<br/>' + p.marker + p.seriesName + ': ' + val;
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
        html += '<div class="quota-usage-row">' + esc(loc.usage || 'Usage') + ': <span class="quota-value">' + q.currentUsage + ' / ' + q.total + '</span> (' + esc(loc.remaining || 'Remaining') + ': <span class="quota-value">' + (q.remaining ?? (q.total - (q.currentUsage || 0))) + '</span>)</div>';
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

    if (data.level) {
      document.getElementById('header-title').textContent = '[' + data.level + '] GLM Coding Plan Usage';
    }
    document.getElementById('header-updated').textContent = (loc.updated || 'Updated') + ': ' + (data.updated || '');
    document.getElementById('refresh-btn').title = loc.refresh || 'Refresh';
    document.getElementById('settings-label').textContent = loc.settings || 'Settings';
    document.getElementById('apikey-label').textContent = loc.configureApiKey || 'Configure API Key';

    updateQuotas(data.quotas);

    var todaySection = document.getElementById('today-section');
    if (data.today) {
      todaySection.style.display = '';
      document.getElementById('today-section-title').textContent = loc.todayUsage || 'Today Usage';
      document.getElementById('today-tokens-label').textContent = loc.tokens || 'Tokens';
      document.getElementById('today-calls-label').textContent = loc.calls || 'Calls';
      document.getElementById('today-tokens').textContent = data.today.totalTokens;
      document.getElementById('today-calls').textContent = data.today.totalCalls;
      initTodayChart(data.today);
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
    document.getElementById('week-total').textContent = (loc.total || 'Total') + ': ' + d.total;
    initWeekChart(d);
  }

  window.doRefresh = function() {
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
      if (msg.dayRange) {
        currentRange = msg.dayRange;
      }
      updateUI(msg.data);
    }
  });

  var observer = new ResizeObserver(function() {
    if (todayChart) todayChart.resize();
    if (weekChart) weekChart.resize();
  });
  var tc = document.getElementById('today-chart');
  var wc = document.getElementById('week-chart');
  if (tc) observer.observe(tc);
  if (wc) observer.observe(wc);
})();
</script>
</body>
</html>`;
}
