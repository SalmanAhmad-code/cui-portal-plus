(async()=>{
 const $=id=>document.getElementById(id),api=PortalSettings;
 let current=await api.get(),queue=Promise.resolve(),profileURL,pending=0;
 const status=$('status');
 const media=matchMedia('(prefers-color-scheme: dark)');
 const setStatus=text=>{if(status)status.textContent=text;};
 const fields=['font','density','fontSize','radius','wide','background','backgroundFit','backgroundDim','reduceMotion','glass','glassOpacity','glassBlur','buttonStyle','buttonRadius','buttonPadding','profileBorderWidth','profileBorderRadius','profileBorderStyle','navOpacity','navHoverOpacity','navActiveOpacity','navRadius','navPadding','navBorderWidth','resultBorderWidth','scoreHeight','scoreRadius','scoreOverride'];
 const names={background:'Page background',container:'Cards & containers',sidebar:'Sidebar',sidebarText:'Sidebar text',text:'Main text',muted:'Secondary text',button:'Buttons & accent',buttonText:'Button text',border:'Borders',header:'Container headers',input:'Form fields',buttonHover:'Button hover',buttonBorder:'Button border',active:'Active navigation',activeText:'Active navigation text',table:'Table rows',tableAlt:'Alternate rows',tableHeader:'Table headers',notice:'Notices',modal:'Dialogs',profileBorder:'Profile picture border',navBackground:'Normal background',navText:'Normal text',navHover:'Hover background',navHoverText:'Hover text',navBorder:'Navigation border',resultBorder:'Result summary border',scoreTrack:'Marks bar track',scoreFill:'Custom marks fill'};
 const opacityNames={cardOpacity:'Cards & containers',sidebarOpacity:'Sidebar',buttonOpacity:'Buttons',fieldOpacity:'Form fields',tableOpacity:'Table rows',headerOpacity:'Container headers',noticeOpacity:'Notices',modalOpacity:'Dialogs',profileOpacity:'Academic profile',resultOpacity:'Result summary'};
 const palettePresets={
  default:{name:'Default',hint:'Automatic theme colors'},
  midnight:{name:'Midnight',hint:'Deep navy contrast',accent:'indigo',colors:{
   light:{background:'#0f172a',container:'#1e293b',sidebar:'#172554',sidebarText:'#e2e8f0',text:'#e2e8f0',muted:'#94a3b8',button:'#4f46e5',buttonText:'#ffffff',border:'#334155',header:'#1e293b',input:'#0f172a',buttonHover:'#6366f1',buttonBorder:'#6366f1',active:'#6366f1',activeText:'#ffffff',table:'#1e293b',tableAlt:'#273449',tableHeader:'#273449',notice:'#1f2a3f',modal:'#1e293b',profileBorder:'#475569',navBackground:'#1e293b',navText:'#e2e8f0',navHover:'#273449',navHoverText:'#ffffff',navBorder:'#475569',resultBorder:'#475569',scoreTrack:'#334155',scoreFill:'#6366f1'},
   dark:{background:'#0b1120',container:'#17223a',sidebar:'#101a30',sidebarText:'#e2e8f0',text:'#e2e8f0',muted:'#94a3b8',button:'#6366f1',buttonText:'#ffffff',border:'#2a3b57',header:'#17223a',input:'#0b1120',buttonHover:'#818cf8',buttonBorder:'#818cf8',active:'#818cf8',activeText:'#ffffff',table:'#17223a',tableAlt:'#23304a',tableHeader:'#23304a',notice:'#1d2941',modal:'#17223a',profileBorder:'#3b4e70',navBackground:'#17223a',navText:'#e2e8f0',navHover:'#23304a',navHoverText:'#ffffff',navBorder:'#3b4e70',resultBorder:'#3b4e70',scoreTrack:'#2a3b57',scoreFill:'#818cf8'}
  }},
  ocean:{name:'Ocean',hint:'Cool cyan-blue',accent:'teal',colors:{
   light:{background:'#edf7fb',container:'#ffffff',sidebar:'#dff1fa',sidebarText:'#0f172a',text:'#0f172a',muted:'#47637b',button:'#0f766e',buttonText:'#ffffff',border:'#b7d8e6',header:'#ffffff',input:'#f5fbff',buttonHover:'#0f8d83',buttonBorder:'#0f766e',active:'#0f766e',activeText:'#ffffff',table:'#ffffff',tableAlt:'#edf7fb',tableHeader:'#e3f3fa',notice:'#e3f3fa',modal:'#ffffff',profileBorder:'#9dc3d4',navBackground:'#ffffff',navText:'#0f172a',navHover:'#e3f3fa',navHoverText:'#0f172a',navBorder:'#9dc3d4',resultBorder:'#9dc3d4',scoreTrack:'#d8edf6',scoreFill:'#0f766e'},
   dark:{background:'#061821',container:'#0f2a35',sidebar:'#0a2430',sidebarText:'#d8f5ff',text:'#d8f5ff',muted:'#8eb4c4',button:'#14b8a6',buttonText:'#022c22',border:'#215061',header:'#0f2a35',input:'#061821',buttonHover:'#2dd4bf',buttonBorder:'#14b8a6',active:'#2dd4bf',activeText:'#022c22',table:'#0f2a35',tableAlt:'#123848',tableHeader:'#123848',notice:'#103340',modal:'#0f2a35',profileBorder:'#2c5c6d',navBackground:'#0f2a35',navText:'#d8f5ff',navHover:'#123848',navHoverText:'#d8f5ff',navBorder:'#2c5c6d',resultBorder:'#2c5c6d',scoreTrack:'#215061',scoreFill:'#2dd4bf'}
  }},
  rose:{name:'Rose',hint:'Warm magenta tone',accent:'rose',colors:{
   light:{background:'#fff4f8',container:'#ffffff',sidebar:'#ffe8f1',sidebarText:'#3c0f23',text:'#3c0f23',muted:'#7f4a63',button:'#be185d',buttonText:'#ffffff',border:'#f2bfd4',header:'#ffffff',input:'#fff8fb',buttonHover:'#d61f69',buttonBorder:'#be185d',active:'#be185d',activeText:'#ffffff',table:'#ffffff',tableAlt:'#fff1f6',tableHeader:'#ffe8f1',notice:'#ffe8f1',modal:'#ffffff',profileBorder:'#e1a2bd',navBackground:'#ffffff',navText:'#3c0f23',navHover:'#ffe8f1',navHoverText:'#3c0f23',navBorder:'#e1a2bd',resultBorder:'#e1a2bd',scoreTrack:'#f9d7e5',scoreFill:'#be185d'},
   dark:{background:'#2c0b1f',container:'#3b1230',sidebar:'#341026',sidebarText:'#ffd7e7',text:'#ffd7e7',muted:'#d093b0',button:'#f472b6',buttonText:'#4a0026',border:'#7f2a57',header:'#3b1230',input:'#2c0b1f',buttonHover:'#fb8fc6',buttonBorder:'#f472b6',active:'#fb8fc6',activeText:'#4a0026',table:'#3b1230',tableAlt:'#4d1940',tableHeader:'#4d1940',notice:'#441737',modal:'#3b1230',profileBorder:'#8f3562',navBackground:'#3b1230',navText:'#ffd7e7',navHover:'#4d1940',navHoverText:'#ffd7e7',navBorder:'#8f3562',resultBorder:'#8f3562',scoreTrack:'#7f2a57',scoreFill:'#fb8fc6'}
  }},
  sand:{name:'Sand',hint:'Soft warm neutrals',accent:'amber',colors:{
   light:{background:'#f7f1e7',container:'#ffffff',sidebar:'#efe4d2',sidebarText:'#2f2417',text:'#2f2417',muted:'#695745',button:'#92400e',buttonText:'#ffffff',border:'#dcc9ad',header:'#ffffff',input:'#fbf7f1',buttonHover:'#b45309',buttonBorder:'#92400e',active:'#92400e',activeText:'#ffffff',table:'#ffffff',tableAlt:'#f7f1e7',tableHeader:'#efe4d2',notice:'#efe4d2',modal:'#ffffff',profileBorder:'#c8af8f',navBackground:'#ffffff',navText:'#2f2417',navHover:'#efe4d2',navHoverText:'#2f2417',navBorder:'#c8af8f',resultBorder:'#c8af8f',scoreTrack:'#ead9c1',scoreFill:'#92400e'},
   dark:{background:'#2a2016',container:'#3b2d1f',sidebar:'#342819',sidebarText:'#fbeed9',text:'#fbeed9',muted:'#c9ae89',button:'#f59e0b',buttonText:'#3f2600',border:'#73563b',header:'#3b2d1f',input:'#2a2016',buttonHover:'#fbbf24',buttonBorder:'#f59e0b',active:'#fbbf24',activeText:'#3f2600',table:'#3b2d1f',tableAlt:'#4a3928',tableHeader:'#4a3928',notice:'#433322',modal:'#3b2d1f',profileBorder:'#846346',navBackground:'#3b2d1f',navText:'#fbeed9',navHover:'#4a3928',navHoverText:'#fbeed9',navBorder:'#846346',resultBorder:'#846346',scoreTrack:'#73563b',scoreFill:'#fbbf24'}
  }},
  slate:{name:'Slate',hint:'Balanced gray-blue',accent:'blue',colors:{
   light:{background:'#f2f5f8',container:'#ffffff',sidebar:'#e8edf3',sidebarText:'#1f2a37',text:'#1f2a37',muted:'#526273',button:'#1d4ed8',buttonText:'#ffffff',border:'#cfd9e5',header:'#ffffff',input:'#f7f9fc',buttonHover:'#2563eb',buttonBorder:'#1d4ed8',active:'#1d4ed8',activeText:'#ffffff',table:'#ffffff',tableAlt:'#f2f5f8',tableHeader:'#e8edf3',notice:'#e8edf3',modal:'#ffffff',profileBorder:'#b7c6d8',navBackground:'#ffffff',navText:'#1f2a37',navHover:'#e8edf3',navHoverText:'#1f2a37',navBorder:'#b7c6d8',resultBorder:'#b7c6d8',scoreTrack:'#d9e2ec',scoreFill:'#1d4ed8'},
   dark:{background:'#111827',container:'#1f2937',sidebar:'#1b2431',sidebarText:'#e5e7eb',text:'#e5e7eb',muted:'#9ca3af',button:'#3b82f6',buttonText:'#0b1220',border:'#334155',header:'#1f2937',input:'#111827',buttonHover:'#60a5fa',buttonBorder:'#3b82f6',active:'#60a5fa',activeText:'#0b1220',table:'#1f2937',tableAlt:'#243244',tableHeader:'#243244',notice:'#223042',modal:'#1f2937',profileBorder:'#465a76',navBackground:'#1f2937',navText:'#e5e7eb',navHover:'#243244',navHoverText:'#e5e7eb',navBorder:'#465a76',resultBorder:'#465a76',scoreTrack:'#334155',scoreFill:'#60a5fa'}
  }}
 };

 for(const [key,name] of Object.entries(opacityNames)){
  fields.push(key);
  const holder=$('opacity-controls');
  if(!holder)continue;
  const label=document.createElement('label');label.htmlFor=key;label.append(document.createTextNode(name));
  const output=document.createElement('output');output.id=key+'-value';
  const input=document.createElement('input');input.type='range';input.id=key;input.min='0';input.max='100';
  label.append(output,input);holder.append(label);
 }

 for(const [key,name] of Object.entries(names)){
  const row=document.createElement('div');row.className='color-row';
  const input=document.createElement('input');input.type='color';input.id='color-'+key;input.setAttribute('aria-label',name);
  const label=document.createElement('label');label.htmlFor=input.id;label.append(document.createTextNode(name));const code=document.createElement('small');code.id='code-'+key;label.append(code);
  const reset=document.createElement('button');reset.type='button';reset.textContent='↺';reset.setAttribute('aria-label','Reset '+name.toLowerCase());
  input.addEventListener('input',()=>update({colors:{...current.colors,[key]:input.value}}));
  reset.addEventListener('click',()=>{const colors={...current.colors};delete colors[key];update({colors});});
  row.append(input,label,reset);
  const target=$(key==='profileBorder'?'profile-border-color':['active','activeText','navBackground','navText','navHover','navHoverText','navBorder'].includes(key)?'nav-colors':'colors');
  if(target)target.append(row);
 }

 const paletteGrid=$('palette-grid');
 if(paletteGrid){
  for(const [id,palette] of Object.entries(palettePresets)){
   const button=document.createElement('button');button.type='button';button.className='palette-card';button.dataset.palette=id;
   const title=document.createElement('strong');title.textContent=palette.name;
   const hint=document.createElement('small');hint.textContent=palette.hint;
   button.append(title,hint);
   if(palette.colors){
    const swatches=document.createElement('div');swatches.className='palette-swatches';
    const sample=palette.colors.light;
    for(const key of ['background','container','button','sidebar','text']){const chip=document.createElement('span');chip.style.background=sample[key];swatches.append(chip);}button.append(swatches);
   }
   button.addEventListener('click',()=>applyPalette(id));
   paletteGrid.append(button);
  }
 }

 const isDark=value=>value.theme==='dark'||(value.theme==='system'&&media.matches);
 const defaults=(dark,state)=>({background:dark?'#0e1220':'#f8f9fe',container:dark?'#171d2e':'#ffffff',sidebar:dark?'#171d2e':'#ffffff',sidebarText:dark?'#f0f2fa':'#14161f',text:dark?'#f0f2fa':'#14161f',muted:dark?'#a9b4c9':'#677080',button:api.ACCENTS[state.accent],buttonText:'#ffffff',border:dark?'#303a52':'#e1e5ef',header:dark?'#171d2e':'#ffffff',input:dark?'#0e1220':'#f8f9fe',buttonHover:api.ACCENTS[state.accent],buttonBorder:api.ACCENTS[state.accent],active:api.ACCENTS[state.accent],activeText:'#ffffff',table:dark?'#171d2e':'#ffffff',tableAlt:dark?'#222b40':'#f0f2fb',tableHeader:dark?'#222b40':'#f0f2fb',notice:dark?'#222b40':'#f0f2fb',modal:dark?'#171d2e':'#ffffff',profileBorder:dark?'#303a52':'#e1e5ef',navBackground:dark?'#171d2e':'#ffffff',navText:dark?'#f0f2fa':'#14161f',navHover:dark?'#222b40':'#f0f2fb',navHoverText:dark?'#f0f2fa':'#14161f',navBorder:dark?'#303a52':'#e1e5ef',resultBorder:dark?'#303a52':'#e1e5ef',scoreTrack:dark?'#222b40':'#f0f2fb',scoreFill:state.colors.button||api.ACCENTS[state.accent]});

 function detectPalette(value){
  if(!Object.keys(value.colors||{}).length)return 'default';
  const dark=isDark(value);
  for(const [id,palette] of Object.entries(palettePresets)){
   if(!palette.colors)continue;
   const target=palette.colors[dark?'dark':'light'];
   if(Object.keys(target).every(key=>value.colors[key]===target[key]))return id;
  }
  return '';
 }

 function render(s){
  current=api.normalize(s);
  const dark=isDark(current);
  document.documentElement.dataset.theme=dark?'dark':'light';
  document.querySelectorAll('[data-theme]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.theme===current.theme)));
  for(const key of fields){
   const input=$(key);
   if(!input)continue;
   if(input.type==='checkbox')input.checked=current[key];
   else input.value=current[key];
   const output=$(key+'-value');
   if(output)output.textContent=current[key]+((key.endsWith('Opacity')||key==='backgroundDim')?'%':' px');
  }
  const c={...defaults(dark,current),...current.colors};
  if(!current.colors.active)c.active=c.button;
  if(!current.colors.activeText)c.activeText=c.buttonText;
  if(!current.colors.navText)c.navText=c.sidebarText;
  for(const key of Object.keys(names)){
   const colorInput=$('color-'+key),code=$('code-'+key);
   if(colorInput)colorInput.value=c[key];
   if(code)code.textContent=current.colors[key]||'Automatic';
  }
  const photoPreview=document.querySelector('.profile-upload-preview');
  if(photoPreview){
   photoPreview.style.border=`${current.profileBorderWidth}px ${current.profileBorderStyle} ${c.profileBorder}`;
   photoPreview.style.borderRadius=current.profileBorderRadius+'px';
  }
  const luminance=hex=>{const values=hex.slice(1).match(/../g).map(v=>{const n=parseInt(v,16)/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;});return values[0]*.2126+values[1]*.7152+values[2]*.0722;};
  const a=luminance(c.button),b=luminance(c.buttonText),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  const contrast=$('contrast');
  if(contrast)contrast.textContent=ratio<4.5?'Button text may be hard to read. Try a lighter or darker text color.':'Button text contrast looks good.';
  const activePalette=detectPalette(current);
  document.querySelectorAll('.palette-card').forEach(card=>card.setAttribute('aria-pressed',String(card.dataset.palette===activePalette)));
 }

 function update(patch){
  const next=api.normalize({...current,...patch});
  render(next);pending++;setStatus('Saving…');
  queue=queue.catch(()=>{}).then(()=>api.set(next)).then(()=>{setStatus('Saved · applied to your portal');}).catch(()=>{setStatus('Could not save. Your last saved settings are still available.');}).finally(()=>{pending--;});
  return queue;
 }

 function applyPalette(id){
  if(id==='default'){update({colors:{}});return;}
  const palette=palettePresets[id];
  if(!palette?.colors)return;
  const colors={...palette.colors[isDark(current)?'dark':'light']};
  const patch={colors};
  if(palette.accent)patch.accent=palette.accent;
  update(patch);
 }

 for(const key of fields){
  const input=$(key);
  if(!input)continue;
  input.addEventListener('input',()=>update({[key]:typeof api.DEFAULTS[key]==='boolean'?input.checked:typeof api.DEFAULTS[key]==='number'?Number(input.value):input.value}));
 }
 document.querySelectorAll('[data-theme]').forEach(button=>button.addEventListener('click',()=>update({theme:button.dataset.theme})));
 const editor=$('editor');if(editor)editor.addEventListener('submit',event=>event.preventDefault());
 const closeButton=$('close');if(closeButton)closeButton.addEventListener('click',()=>parent.postMessage('cui-customizer-close','*'));

 const quickStart=$('panel-quick-start');
 if(quickStart)quickStart.addEventListener('toggle',()=>{if(!quickStart.open)quickStart.open=true;});
 document.querySelectorAll('details[data-advanced-panel]').forEach(panel=>panel.addEventListener('toggle',()=>{
  if(!panel.open)return;
  document.querySelectorAll('details[data-advanced-panel]').forEach(other=>{if(other!==panel)other.open=false;});
 }));

 async function fileInfo(){
  const file=await PortalMedia.get();
  const fileName=$('file-name');
  if(fileName)fileName.textContent=file?`${file.name||'Local background'} · ${(file.size/1048576).toFixed(1)} MB`:'No background selected';
  const profile=await PortalMedia.get('profile');
  if(profileURL)URL.revokeObjectURL(profileURL);profileURL=null;
  const profileFile=$('profile-file-name');
  if(profileFile)profileFile.textContent=profile?`${profile.name||'Custom profile picture'} · ${(profile.size/1048576).toFixed(1)} MB`:'Using university photo';
  const preview=$('profile-preview'),placeholder=$('profile-placeholder');
  if(preview)preview.hidden=!profile;
  if(placeholder)placeholder.hidden=!!profile;
  if(preview){
   if(profile){profileURL=URL.createObjectURL(profile);preview.src=profileURL;}
   else preview.removeAttribute('src');
  }
  render(current);
 }

 async function validate(file){
  const url=URL.createObjectURL(file);
  try{await new Promise((resolve,reject)=>{
   const el=document.createElement(file.type.startsWith('video/')?'video':'img');
   const timer=setTimeout(()=>{el.removeAttribute('src');reject(new Error('Media timed out'));},12000);
   const done=()=>{clearTimeout(timer);resolve();};el.onerror=()=>{clearTimeout(timer);reject(new Error('Unsupported media'));};
   if(el.tagName==='VIDEO'){el.preload='metadata';el.onloadedmetadata=done;}else el.onload=done;el.src=url;
  });}finally{URL.revokeObjectURL(url);}
 }

 async function uploadFile(file,key){
  const profile=key==='profile',input=$(profile?'profile-upload':'upload');
  if(!file||!input||input.disabled)return;
  const types=['image/png','image/jpeg','image/webp','image/gif',...(profile?[]:['video/mp4','video/webm'])];
  const limit=profile?10:100;
  if(!types.includes(file.type)||file.size>limit*1048576||file.size===0){setStatus(profile?'Choose a supported profile image under 10 MB.':'Choose a supported image or video under 100 MB.');input.value='';return;}
  const zone=$(profile?'profile-drop':'bg-drop');
  input.disabled=true;if(zone)zone.setAttribute('aria-busy','true');setStatus(profile?'Saving local profile picture…':'Saving local background…');
  try{await validate(file);await PortalMedia.put(file,key);await update(profile?{customProfile:true,profileRevision:Date.now()}:{background:'media',mediaRevision:Date.now()});await fileInfo();}
  catch{setStatus('Could not use this file. Check its format or available device storage.');}
  finally{input.disabled=false;input.value='';if(zone)zone.removeAttribute('aria-busy');}
 }

 for(const [id,key] of [['upload','background'],['profile-upload','profile']]){
  const input=$(id);if(input)input.addEventListener('change',()=>uploadFile(input.files?.[0],key));
 }
 for(const [id,key] of [['bg-drop','background'],['profile-drop','profile']]){
  const zone=$(id);if(!zone)continue;
  zone.addEventListener('dragenter',event=>{event.preventDefault();zone.setAttribute('data-dragging','');});
  zone.addEventListener('dragover',event=>{event.preventDefault();if(event.dataTransfer)event.dataTransfer.dropEffect='copy';});
  zone.addEventListener('dragleave',event=>{if(!zone.contains(event.relatedTarget))zone.removeAttribute('data-dragging');});
  zone.addEventListener('drop',event=>{event.preventDefault();event.stopPropagation();zone.removeAttribute('data-dragging');const files=event.dataTransfer?.files;
   if(files?.length!==1){setStatus('Drop one file at a time.');return;}uploadFile(files[0],key);
  });
 }

 document.addEventListener('dragover',event=>event.preventDefault());
 document.addEventListener('drop',event=>event.preventDefault());

 const removeMedia=$('remove-media');
 if(removeMedia)removeMedia.addEventListener('click',async()=>{try{await PortalMedia.remove();await update({background:'solid',mediaRevision:Date.now()});await fileInfo();}catch{setStatus('Could not remove the background.');}});
 const removeProfile=$('remove-profile');
 if(removeProfile)removeProfile.addEventListener('click',async()=>{try{await PortalMedia.remove('profile');await update({customProfile:false,profileRevision:Date.now()});await fileInfo();}catch{setStatus('Could not restore the university photo.');}});
 const reset=$('reset'),cancelReset=$('cancel-reset'),confirmReset=$('confirm-reset'),resetConfirm=$('reset-confirm');
 if(reset&&resetConfirm)reset.addEventListener('click',()=>{resetConfirm.hidden=false;});
 if(cancelReset&&resetConfirm)cancelReset.addEventListener('click',()=>{resetConfirm.hidden=true;});
 if(confirmReset&&resetConfirm)confirmReset.addEventListener('click',async()=>{try{await PortalMedia.remove();await PortalMedia.remove('profile');await update({...api.DEFAULTS,mediaRevision:Date.now(),profileRevision:Date.now()});await fileInfo();resetConfirm.hidden=true;}catch{setStatus('Could not reset appearance.');}});

 async function themes(){
  const list=$('theme-list');
  if(!list)return;
  list.replaceChildren();
  const collection=await PortalThemes.list();
  if(!collection.length){const p=document.createElement('p');p.className='hint';p.textContent='No saved themes yet. Create your first look above.';list.append(p);}
  for(const theme of collection){
   const card=document.createElement('article');card.className='saved-theme';const name=document.createElement('input');name.type='text';name.value=theme.name;name.maxLength=60;name.setAttribute('aria-label','Theme name: '+theme.name);
   const meta=document.createElement('small');meta.textContent=theme.background?'Includes background file':'Colors & layout';card.append(name,meta);
   const actions=document.createElement('div');card.append(actions);
   for(const label of ['Apply','Export','Rename','Delete']){const button=document.createElement('button');button.type='button';button.textContent=label;actions.append(button);button.addEventListener('click',async()=>{button.disabled=true;try{
    if(label==='Apply'){await queue;render(await PortalThemes.apply(theme));await fileInfo();$('theme-status').textContent='Applied '+theme.name;}
    if(label==='Export'){const json=await PortalThemes.exportTheme(theme);const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=(theme.name.replace(/[^a-z0-9_-]/gi,'-')||'portal-theme')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('theme-status').textContent='Theme exported with its saved background.';}
    if(label==='Rename'){await PortalThemes.rename(theme.id,name.value);await themes();$('theme-status').textContent='Theme renamed.';}
    if(label==='Delete'){if(button.dataset.confirm!=='yes'){button.dataset.confirm='yes';button.textContent='Confirm delete';button.disabled=false;return;}await PortalThemes.remove(theme.id);await themes();$('theme-status').textContent='Theme deleted.';}
   }catch(error){$('theme-status').textContent=error.message||'Could not update theme.';}finally{button.disabled=false;}});}
   list.append(card);
  }
 }
 const saveTheme=$('save-theme');
 if(saveTheme)saveTheme.addEventListener('click',async()=>{const button=saveTheme;button.disabled=true;try{await queue;if(!$('theme-name').value.trim())throw new Error('Give your theme a name first.');await PortalThemes.save($('theme-name').value,current,current.background==='media'?await PortalMedia.get():null);await themes();$('theme-status').textContent='Current theme saved on this device.';}catch(error){$('theme-status').textContent=error.message;}finally{button.disabled=false;}});
 const importTheme=$('import-theme');
 if(importTheme)importTheme.addEventListener('change',async()=>{const file=importTheme.files?.[0];if(!file)return;importTheme.disabled=true;try{await PortalThemes.importTheme(file,validate);await themes();$('theme-status').textContent='Theme imported. Choose Apply when ready.';}catch(error){$('theme-status').textContent=error.message||'Could not import theme.';}finally{importTheme.disabled=false;importTheme.value='';}});

 await themes();
 api.subscribe(value=>{if(!pending)render(value);});
 media.addEventListener('change',()=>render(current));
 render(current);
 await fileInfo();
 setStatus('Ready · all changes save automatically');
 addEventListener('pagehide',()=>{if(profileURL)URL.revokeObjectURL(profileURL);});
})().catch(()=>{const status=document.getElementById('status');if(status)status.textContent='Could not load customization. Reload this page to try again.';});
