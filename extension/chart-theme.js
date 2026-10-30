/* Runs in MAIN world solely to style CanvasJS and ECharts presentation options. No academic data is read,
   copied, messaged, or stored. Keep this file independent of extension APIs. */
(() => {
  'use strict';
  const tracked = new Set();
  const constructors = new WeakMap();
  let printing = false;
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  function colors() {
    const root = document.documentElement;
    const mode = root?.getAttribute('data-cui-plus');
    if (printing || !['light', 'dark'].includes(mode)) return null;
    const dark = mode === 'dark';
    const style = getComputedStyle(root);
    const token = (name, fallback) => style.getPropertyValue(name).trim() || fallback;
    return { bg: token('--cp-surface', dark ? '#171d2e' : '#ffffff'),
      text: token('--cp-text', dark ? '#f0f2fa' : '#14161f'),
      muted: token('--cp-muted', dark ? '#a9b4c9' : '#677080'),
      grid: token('--cp-border', dark ? '#303a52' : '#e1e5ef'),
      hover: token('--cp-soft', dark ? '#222b40' : '#f0f2fb'),
      font: token('--cp-font', 'system-ui, sans-serif') };
  }
  function attach(chart) {
    if (!chart || typeof chart.render !== 'function') return;
    const render = chart.render;
    const changes = [];
    let busy = false;
    function restore() {
      for (let i = changes.length - 1; i >= 0; i--) {
        const c = changes[i];
        // Preserve changes made by the portal after our previous render.
        if (c.object[c.key] !== c.applied) continue;
        if (c.existed) c.object[c.key] = c.original;
        else delete c.object[c.key];
      }
      changes.length = 0;
    }
    function set(object, key, value) {
      changes.push({object, key, original: object[key], existed: own(object, key), applied: value});
      object[key] = value;
    }
    function section(options, key, callback, create = true) {
      if (!options[key] && create) set(options, key, {});
      const value = options[key];
      for (const item of Array.isArray(value) ? value : [value]) {
        if (item && typeof item === 'object') callback(item);
      }
    }
    function theme() {
      restore();
      const c = colors(), o = chart.options;
      if (!c || !o) return;
      set(o, 'backgroundColor', c.bg);
      for (const key of ['title', 'subtitles']) section(o, key, t => {
        set(t, 'fontColor', c.text); set(t, 'fontFamily', c.font);
      }, false);
      section(o, 'legend', l => {set(l, 'fontColor', c.text); set(l, 'fontFamily', c.font);});
      for (const key of ['axisX', 'axisY', 'axisX2', 'axisY2']) section(o, key, a => {
        for (const prop of ['labelFontColor', 'titleFontColor']) set(a, prop, c.muted);
        for (const prop of ['labelFontFamily', 'titleFontFamily']) set(a, prop, c.font);
        for (const prop of ['gridColor', 'lineColor', 'tickColor']) set(a, prop, c.grid);
        set(a, 'interlacedColor', 'transparent');
      }, key === 'axisX' || key === 'axisY');
      section(o, 'toolTip', t => {
        set(t, 'backgroundColor', c.bg); set(t, 'fontColor', c.text);
        set(t, 'borderColor', c.grid); set(t, 'fontFamily', c.font);
      });
      section(o, 'toolbar', t => {
        set(t, 'itemBackgroundColor', c.bg); set(t, 'itemBackgroundColorOnHover', c.hover);
        set(t, 'fontColor', c.text); set(t, 'fontColorOnHover', c.text);
        set(t, 'buttonBorderColor', c.grid);
      });
    }
    chart.render = function (...args) {
      if (busy) return render.apply(this, args);
      busy = true;
      try { theme(); return render.apply(this, args); } finally { busy = false; }
    };
    const record = {chart, refresh: () => chart.render()};
    tracked.add(record);
    if (typeof chart.destroy === 'function') {
      const destroy = chart.destroy;
      chart.destroy = function (...args) {
        tracked.delete(record); restore();
        return destroy.apply(this, args);
      };
    }
  }
  function wrap(Chart) {
    if (typeof Chart !== 'function') return Chart;
    if (constructors.has(Chart)) return constructors.get(Chart);
    const proxy = new Proxy(Chart, {
      construct(target, args, newTarget) {
        const chart = Reflect.construct(target, args, newTarget);
        attach(chart);
        return chart;
      },
      apply(target, receiver, args) {
        const chart = Reflect.apply(target, receiver, args);
        attach(chart);
        return chart;
      }
    });
    constructors.set(Chart, proxy); constructors.set(proxy, proxy);
    return proxy;
  }
  // Observe assignments without searching window globals or touching chart data.
  function watch(object, key, transform) {
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    if (descriptor && (!descriptor.configurable || descriptor.get || descriptor.set)) return false;
    let value = transform(object[key]);
    Object.defineProperty(object, key, {configurable: true, enumerable: descriptor?.enumerable ?? true,
      get: () => value, set: next => {value = transform(next);} });
    return true;
  }
  const namespaces = new WeakSet();
  function namespace(value) {
    if (value && (typeof value === 'object' || typeof value === 'function') && !namespaces.has(value)) {
      namespaces.add(value);
      if (!watch(value, 'Chart', wrap)) {
        try { value.Chart = wrap(value.Chart); } catch (_) { /* Read-only vendor namespace. */ }
      }
    }
    return value;
  }
  watch(window, 'CanvasJS', namespace);
  // ECharts powers the portal's vertical dataView/magicType/restore toolbox.
  // Capture only presentation fields from getOption; never copy series/data.
  const eSeen = new WeakSet();
  const eNamespaces = new WeakSet();
  const eLibraries = new Set();
  const paths = {
    title: ['textStyle.color', 'textStyle.fontFamily', 'subtextStyle.color', 'subtextStyle.fontFamily'],
    legend: ['textStyle.color', 'textStyle.fontFamily', 'inactiveColor'],
    xAxis: ['axisLabel.color', 'axisLabel.fontFamily', 'nameTextStyle.color', 'axisLine.lineStyle.color', 'axisTick.lineStyle.color', 'splitLine.lineStyle.color', 'splitArea.areaStyle.color'],
    yAxis: ['axisLabel.color', 'axisLabel.fontFamily', 'nameTextStyle.color', 'axisLine.lineStyle.color', 'axisTick.lineStyle.color', 'splitLine.lineStyle.color', 'splitArea.areaStyle.color'],
    tooltip: ['backgroundColor', 'borderColor', 'textStyle.color', 'textStyle.fontFamily'],
    series: ['label.color', 'label.fontFamily', 'endLabel.color', 'endLabel.fontFamily'],
    toolbox: ['iconStyle.borderColor', 'emphasis.iconStyle.borderColor']
  };
  function put(object, path, value) {
    const parts = path.split('.');
    for (const key of parts.slice(0, -1)) object = object[key] ||= {};
    object[parts.at(-1)] = value;
  }
  function captureE(chart) {
    if (!chart || eSeen.has(chart) || chart.isDisposed()) return;
    eSeen.add(chart);
    const setOption = chart.setOption;
    let original, themed = false;
    function snapshot() {
      const options = chart.getOption();
      // ECharts has no model until the portal's first setOption. Never create
      // one on its behalf or let optional styling interrupt init().
      if (!options) return null;
      const snapshot = {backgroundColor: options.backgroundColor ?? 'transparent'};
      for (const [key, fields] of Object.entries(paths)) {
        if (!Array.isArray(options[key])) continue;
        snapshot[key] = options[key].map(item => {
          const result = {};
          for (const path of fields) {
            let value = item;
            for (const part of path.split('.')) value = value?.[part];
            // null clears an inherited themed value when an original option is absent.
            put(result, path, value === undefined ? null : Array.isArray(value) ? value.slice() : value);
          }
          return result;
        });
      }
      return snapshot;
    }
    function restore() {
      if (themed && original) setOption.call(chart, original, {silent: true});
      themed = false;
    }
    function apply() {
      if (chart.isDisposed()) {tracked.delete(record); return;}
      const c = colors();
      if (!c) {restore(); return;}
      if (!original) original = snapshot();
      if (!original) return;
      const patch = {backgroundColor: c.bg};
      for (const [key, fields] of Object.entries(paths)) {
        if (!original[key]) continue;
        patch[key] = original[key].map(() => {
          const result = {};
          for (const path of fields) {
            let value = c.muted;
            if (path.endsWith('fontFamily')) value = c.font;
            else if (path === 'backgroundColor') value = c.bg;
            else if (/splitArea/.test(path)) value = [c.bg, c.hover];
            else if (key === 'toolbox') value = c.muted;
            else if (/splitLine|axisLine|axisTick|borderColor/.test(path)) value = c.grid;
            else if (key === 'title' && path.startsWith('textStyle') || key === 'legend' && path.startsWith('textStyle') || key === 'tooltip') value = c.text;
            else if (key === 'series') value = c.text;
            put(result, path, value);
          }
          return result;
        });
      }
      setOption.call(chart, patch, {silent: true});
      themed = true;
    }
    chart.setOption = function (...args) {
      try {restore();} catch (_) { /* Portal updates take priority. */ }
      const result = setOption.apply(this, args);
      try {original = snapshot(); apply();} catch (_) {
        try {restore();} catch (_) { /* Theme failure must not break the chart. */ }
      }
      return result;
    };
    const record = {chart, refresh: apply};
    tracked.add(record);
    const dispose = chart.dispose;
    chart.dispose = function (...args) {
      tracked.delete(record);
      return dispose.apply(this, args);
    };
    // Vendor restore/magicType actions may recreate model styles internally.
    chart.on('restore', schedule);
    chart.on('magictypechanged', schedule);
    apply();
  }
  function scanE() {
    for (const library of eLibraries) {
      if (typeof library.getInstanceByDom !== 'function') continue;
      for (const element of document.querySelectorAll('[_echarts_instance_]')) {
        try {captureE(library.getInstanceByDom(element));} catch (_) { /* Other charts remain usable. */ }
      }
    }
  }
  function eNamespace(value) {
    if (!value || (typeof value !== 'object' && typeof value !== 'function') || eNamespaces.has(value)) return value;
    eNamespaces.add(value); eLibraries.add(value);
    const wrapInit = init => typeof init !== 'function' ? init : function (...args) {
      const chart = init.apply(this, args);
      try {captureE(chart);} catch (_) { /* Always return the original chart. */ }
      return chart;
    };
    // UMD builds first assign an empty exports object, then populate init.
    if (!watch(value, 'init', wrapInit)) {
      try {value.init = wrapInit(value.init);} catch (_) { /* DOM lookup fallback. */ }
    }
    queueMicrotask(() => {scanE(); schedule();});
    return value;
  }
  watch(window, 'echarts', eNamespace);

  function refresh() {
    scanE();
    for (const record of tracked) {
      try { record.refresh(); } catch (_) { /* A removed chart must not block the portal. */ }
    }
  }
  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {pending = false; refresh();});
  }
  function observe() {
    if (!document.documentElement) return;
    new MutationObserver(records => {
      if (records.some(r => (r.type === 'attributes' && r.target === document.documentElement) ||
        (r.target.nodeType === 1 && r.target.matches('style[data-cui-owned]')) ||
        r.target.parentElement?.matches('style[data-cui-owned]') ||
        (r.type === 'attributes' && r.attributeName === '_echarts_instance_') ||
        (r.type === 'childList' && [...r.addedNodes].some(n => n.nodeType === 1 && (n.matches('[_echarts_instance_]') || n.querySelector('[_echarts_instance_]')))))) schedule();
    }).observe(document.documentElement,
      {attributes: true, attributeFilter: ['data-cui-plus', 'style', '_echarts_instance_'], childList: true, characterData: true, subtree: true});
    // Settings write a stylesheet after the root theme attribute; observer callback
    // runs after that synchronous update. Font loads also need a canvas redraw.
    document.fonts?.ready.then(schedule);
    document.fonts?.addEventListener('loadingdone', schedule);
  }
  if (document.documentElement) observe();
  else new MutationObserver((_, observer) => {
    if (document.documentElement) {observer.disconnect(); observe();}
  }).observe(document, {childList: true});
  addEventListener('beforeprint', () => {printing = true; refresh();});
  addEventListener('afterprint', () => {printing = false; refresh();});
})();
