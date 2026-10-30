/* Shared between the isolated content script and popup. No portal data is read. */
(() => {
  'use strict';
  const DEFAULTS = Object.freeze({enabled:true, theme:'light', accent:'hub', font:'hub', fontSize:15, density:'comfortable', radius:12, wide:false, reduceMotion:false, background:'solid', backgroundFit:'cover', backgroundDim:30, glass:false, glassOpacity:85, glassBlur:16, mediaRevision:0,scoreHeight:12,scoreRadius:6,scoreOverride:false,resultOpacity:100,resultBorderWidth:1,navOpacity:100,navHoverOpacity:100,navActiveOpacity:100,navRadius:12,navPadding:14,navBorderWidth:1,profileBorderWidth:1,profileBorderRadius:14,profileBorderStyle:'solid',customProfile:false,profileRevision:0, cardOpacity:100,sidebarOpacity:100,buttonOpacity:100,fieldOpacity:100,tableOpacity:100,headerOpacity:100,noticeOpacity:100,modalOpacity:100,profileOpacity:100, buttonStyle:'filled', buttonRadius:10, buttonPadding:12, colors:{}});
  const THEMES = ['light','dark','system'];
  const ACCENTS = {hub:'#3454d1', indigo:'#4f46e5', blue:'#1d4ed8', teal:'#0f766e', rose:'#be185d', amber:'#92400e'};
  const FONTS = {hub:'"CUI Plex", system-ui, sans-serif', system:'system-ui, -apple-system, "Segoe UI", sans-serif', humanist:'"Trebuchet MS", "Segoe UI", sans-serif', classic:'Georgia, "Times New Roman", serif'};
  const KEY = 'cuiPortalPlus';
  const extension = Boolean(globalThis.chrome?.runtime?.id && globalThis.chrome?.storage?.local);
  function normalize(input) {
    const value = input && typeof input === 'object' ? input : {};
    const oneOf = (key, options) => options.includes(value[key]) ? value[key] : DEFAULTS[key];
    const number = (key, min, max) => typeof value[key] === 'number' && Number.isFinite(value[key]) ? Math.round(Math.min(max,Math.max(min,value[key]))) : DEFAULTS[key];
    const colors = {};
    for (const key of ['background','container','sidebar','sidebarText','text','muted','button','buttonText','border','header','input','buttonHover','buttonBorder','active','activeText','table','tableAlt','tableHeader','notice','modal','profileBorder','navBackground','navText','navHover','navHoverText','navBorder','resultBorder','scoreTrack','scoreFill']) {
      const color = value.colors?.[key];
      if (typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color)) colors[key] = color.toLowerCase();
    }
    return {colors,scoreHeight:number('scoreHeight',4,32),scoreRadius:number('scoreRadius',0,16),scoreOverride:typeof value.scoreOverride==='boolean'?value.scoreOverride:false,resultOpacity:number('resultOpacity',0,100),resultBorderWidth:number('resultBorderWidth',0,6),navOpacity:number('navOpacity',0,100),navHoverOpacity:number('navHoverOpacity',0,100),navActiveOpacity:number('navActiveOpacity',0,100),navRadius:number('navRadius',0,28),navPadding:number('navPadding',6,22),navBorderWidth:number('navBorderWidth',0,6),profileBorderWidth:number('profileBorderWidth',0,12),profileBorderRadius:number('profileBorderRadius',0,60),profileBorderStyle:oneOf('profileBorderStyle',['solid','dashed','dotted','double','none']),customProfile:typeof value.customProfile==='boolean'?value.customProfile:false,profileRevision:number('profileRevision',0,9007199254740991), ...Object.fromEntries(['cardOpacity','sidebarOpacity','buttonOpacity','fieldOpacity','tableOpacity','headerOpacity','noticeOpacity','modalOpacity','profileOpacity'].map(key=>[key,number(key,0,100)])), buttonStyle:oneOf('buttonStyle',['filled','outline','soft']),buttonRadius:number('buttonRadius',0,28),buttonPadding:number('buttonPadding',6,20), background:oneOf('background',['solid','media']), backgroundFit:oneOf('backgroundFit',['cover','contain']), backgroundDim:number('backgroundDim',0,90), glass:typeof value.glass==='boolean'?value.glass:false, glassOpacity:number('glassOpacity',20,100), glassBlur:number('glassBlur',0,32), mediaRevision:number('mediaRevision',0,9007199254740991), enabled:typeof value.enabled==='boolean'?value.enabled:DEFAULTS.enabled, theme:oneOf('theme',THEMES), accent:oneOf('accent',Object.keys(ACCENTS)), font:oneOf('font',Object.keys(FONTS)), fontSize:number('fontSize',12,20), density:oneOf('density',['comfortable','compact']), radius:number('radius',0,20), wide:typeof value.wide==='boolean'?value.wide:DEFAULTS.wide, reduceMotion:typeof value.reduceMotion==='boolean'?value.reduceMotion:DEFAULTS.reduceMotion};
  }
  async function get() {
    if (extension) return normalize((await chrome.storage.local.get(KEY))[KEY]);
    try {return normalize(JSON.parse(localStorage.getItem(KEY)));} catch {return normalize(null);}
  }
  async function set(value) {
    const clean = normalize(value);
    if (extension) await chrome.storage.local.set({[KEY]:clean});
    else {localStorage.setItem(KEY,JSON.stringify(clean)); window.dispatchEvent(new Event('cui-settings'));}
    return clean;
  }
  function subscribe(callback) {
    if (extension) {
      const listener = (changes,area) => {if(area==='local' && changes[KEY]) callback(normalize(changes[KEY].newValue));};
      chrome.storage.onChanged.addListener(listener);
      return () => chrome.storage.onChanged.removeListener(listener);
    }
    const listener = event => {if(event.type==='cui-settings' || event.key===KEY || event.key===null) get().then(callback);};
    window.addEventListener('storage',listener); window.addEventListener('cui-settings',listener);
    return () => {window.removeEventListener('storage',listener); window.removeEventListener('cui-settings',listener);};
  }
  globalThis.PortalSettings = Object.freeze({DEFAULTS,ACCENTS,FONTS,normalize,get,set,subscribe});
})();
