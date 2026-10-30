(() => {
  'use strict';
  const settings = PortalSettings;
  let current = settings.normalize(null);
  const dark = matchMedia('(prefers-color-scheme: dark)');
  let sheet, backdrop;
  const baseURL=globalThis.chrome?.runtime?.id ? chrome.runtime.getURL('') : new URL('.',document.currentScript?.src||location.href).href;
  function apply(value) {
    current = settings.normalize(value);
    const root = document.documentElement;
    if (!root) return;
    // Let verification pages render normally. Never interact with their controls.
    const challenge = /^(Just a moment|Attention Required)/i.test(document.title) || document.querySelector('#challenge-running, #challenge-stage, .cf-turnstile');
    if (!current.enabled || challenge) {
      root.removeAttribute('data-cui-plus');
      root.removeAttribute('data-cui-motion');
      root.removeAttribute('data-cui-wide');
      root.removeAttribute('data-cui-media');root.removeAttribute('data-cui-glass');root.removeAttribute('data-cui-button-style');root.removeAttribute('data-cui-opacity');root.removeAttribute('data-cui-nav-opacity');root.removeAttribute('data-cui-score-override');for(const key of ['card','sidebar','button','field','table','header','notice','modal','profile','result'])root.removeAttribute('data-cui-fade-'+key);
      backdrop?.remove();backdrop=undefined;
      sheet?.remove(); sheet = undefined;
      return;
    }
    root.setAttribute('data-cui-plus',current.theme==='system' ? (dark.matches?'dark':'light') : current.theme);
    if (!sheet) {sheet = document.createElement('style'); sheet.dataset.cuiOwned='true'; root.append(sheet);}
    // All interpolated values are normalized enum values or bounded numbers.
    sheet.textContent = `@media screen {html[data-cui-plus]{--cp-accent:${settings.ACCENTS[current.accent]};--cp-font:${settings.FONTS[current.font]};--cp-size:${current.fontSize}px;--cp-radius:${current.radius}px;--cp-pad:${current.density==='compact'?8:14}px;--cp-width:${current.wide?'none':'1280px'};}}`;
    const tokens={background:'--cp-bg',container:'--cp-surface',text:'--cp-text',muted:'--cp-muted',button:'--cp-accent',buttonText:'--cp-button-text',border:'--cp-border',sidebar:'--cp-sidebar',sidebarText:'--cp-sidebar-text',header:'--cp-header',input:'--cp-input',buttonHover:'--cp-button-hover',buttonBorder:'--cp-button-border',active:'--cp-nav-active',activeText:'--cp-nav-active-text',table:'--cp-table',tableAlt:'--cp-table-alt',tableHeader:'--cp-table-header',notice:'--cp-notice',modal:'--cp-modal',profileBorder:'--cp-photo-border',navBackground:'--cp-nav-bg',navText:'--cp-nav-text',navHover:'--cp-nav-hover',navHoverText:'--cp-nav-hover-text',navBorder:'--cp-nav-border',resultBorder:'--cp-result-border',scoreTrack:'--cp-score-track',scoreFill:'--cp-score-fill'};
    const overrides=Object.entries(current.colors).map(([key,color])=>`${tokens[key]}:${color}!important;`).join('');
    sheet.textContent+=`@media screen {html[data-cui-plus]{${overrides}--cp-glass-opacity:${current.glassOpacity}%;--cp-glass-blur:${current.glassBlur}px;--cp-button-radius:${current.buttonRadius}px;--cp-button-pad:${current.buttonPadding}px;--cp-photo-border-width:${current.profileBorderWidth}px;--cp-photo-radius:${current.profileBorderRadius}px;--cp-photo-border-style:${current.profileBorderStyle};--cp-score-height:${current.scoreHeight}px;--cp-score-radius:${current.scoreRadius}px;--cp-result-border-width:${current.resultBorderWidth}px;--cp-nav-radius:${current.navRadius}px;--cp-nav-pad:${current.navPadding}px;--cp-nav-border-width:${current.navBorderWidth}px;--cp-nav-opacity:${current.navOpacity}%;--cp-nav-hover-opacity:${current.navHoverOpacity}%;--cp-nav-active-opacity:${current.navActiveOpacity}%;}}`;
    root.toggleAttribute('data-cui-score-override',current.scoreOverride);
    root.toggleAttribute('data-cui-nav-opacity',[current.navOpacity,current.navHoverOpacity,current.navActiveOpacity].some(n=>n<100));
    root.toggleAttribute('data-cui-glass',current.glass);root.setAttribute('data-cui-button-style',current.buttonStyle);
    root.toggleAttribute('data-cui-media',current.background==='media');
    if(current.background==='media' && document.body && !backdrop){
      backdrop=document.createElement('iframe');backdrop.id='cp-background';backdrop.title='Custom background';backdrop.tabIndex=-1;backdrop.setAttribute('aria-hidden','true');backdrop.src=baseURL+'background.html';document.body.prepend(backdrop);
    }else if(current.background!=='media'){backdrop?.remove();backdrop=undefined;}
    const opacityKeys=['card','sidebar','button','field','table','header','notice','modal','profile','result'];
    for(const key of opacityKeys)root.toggleAttribute('data-cui-fade-'+key,current[key+'Opacity']<100);
    const opacityTokens=opacityKeys.map(key=>`--cp-${key}-opacity:${current[key+'Opacity']}%;`).join('');
    sheet.textContent+=`@media screen{html[data-cui-plus]{${opacityTokens}--cp-button-tint:${current.buttonOpacity*.18}%;}}`;
    root.toggleAttribute('data-cui-opacity',opacityKeys.some(key=>current[key+'Opacity']<100));
    root.toggleAttribute('data-cui-motion',current.reduceMotion);
    root.toggleAttribute('data-cui-wide',current.wide);
  }
  settings.subscribe(apply);
  settings.get().then(apply).catch(()=>{});
  dark.addEventListener('change',()=>apply(current));
  document.addEventListener('DOMContentLoaded',()=>apply(current),{once:true});
})();
