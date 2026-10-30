(async () => {
  'use strict';
  const $ = id => document.getElementById(id);
  const api = PortalSettings;
  let current;
  let queue = Promise.resolve();
  const media = matchMedia('(prefers-color-scheme: dark)');
  const status = $('status');
  const editable = ['font','fontSize','density','radius','wide','reduceMotion'];
  function render(value) {
    current = api.normalize(value);
    $('enabled').checked=current.enabled;
    document.querySelectorAll('fieldset').forEach(el=>el.disabled=!current.enabled);
    document.querySelectorAll('[data-theme]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.theme===current.theme)));
    document.querySelectorAll('[data-accent]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.accent===current.accent)));
    editable.forEach(key=>{if(typeof current[key]==='boolean') $(key).checked=current[key];else $(key).value=current[key];});
    $('accent-name').textContent=current.accent[0].toUpperCase()+current.accent.slice(1);
    $('size-value').textContent=`${current.fontSize} px`;
    $('radius-value').textContent=`${current.radius} px`;
    const preview=$('preview-card');
    const isDark=current.theme==='dark'||(current.theme==='system'&&media.matches);
    preview.style.background=isDark?'#1a2232':'#fff'; preview.style.color=isDark?'#e6ebf5':'#202b43';
    preview.style.borderColor=isDark?'#39465e':'#e2e5ed';
    preview.style.fontFamily=api.FONTS[current.font];
    preview.style.borderRadius=`${current.radius}px`;
    preview.style.fontSize=`${current.fontSize}px`;
    preview.style.padding=current.density==='compact'?'10px':'16px';
    preview.querySelector('h2').style.fontSize=`${current.fontSize+3}px`;
    preview.style.setProperty('--preview-accent',current.colors.button||api.ACCENTS[current.accent]);
  }
  function update(patch) {
    const next=api.normalize({...current,...patch}); render(next);
    status.textContent='Saving…';
    queue=queue.catch(()=>{}).then(()=>api.set(next)).then(()=>{status.textContent='✓ Saved on this device · applies to open portal pages';}).catch(()=>{status.textContent='Could not save. Reopen the extension and try again.';});
  }
  try {render(await api.get());status.textContent='Preferences ready · changes save automatically';}
  catch {status.textContent='Could not load preferences. Reopen the extension.';return;}
  $('enabled').addEventListener('change',()=>update({enabled:$('enabled').checked}));
  $('settings').addEventListener('submit',event=>event.preventDefault());
  document.querySelectorAll('[data-theme]').forEach(button=>button.addEventListener('click',()=>update({theme:button.dataset.theme})));
  document.querySelectorAll('[data-accent]').forEach(button=>button.addEventListener('click',()=>update({accent:button.dataset.accent,colors:Object.fromEntries(Object.entries(current.colors).filter(([key])=>key!=='button'))})));
  editable.forEach(key=>$(key).addEventListener('input',()=>update({[key]:typeof api.DEFAULTS[key]==='boolean'?$(key).checked:typeof api.DEFAULTS[key]==='number'?Number($(key).value):$(key).value})));
  $('reset').addEventListener('click',()=>update(api.DEFAULTS));
  media.addEventListener('change',()=>render(current));
})();
