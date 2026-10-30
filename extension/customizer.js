(async()=>{
 const $=id=>document.getElementById(id),api=PortalSettings;
 let current=await api.get(),queue=Promise.resolve(),previewURL,profileURL,pending=0;
 const fields=['font','density','fontSize','radius','wide','background','backgroundFit','backgroundDim','reduceMotion','glass','glassOpacity','glassBlur','buttonStyle','buttonRadius','buttonPadding','profileBorderWidth','profileBorderRadius','profileBorderStyle','navOpacity','navHoverOpacity','navActiveOpacity','navRadius','navPadding','navBorderWidth','resultBorderWidth','scoreHeight','scoreRadius','scoreOverride'];
 const names={background:'Page background',container:'Cards & containers',sidebar:'Sidebar',sidebarText:'Sidebar text',text:'Main text',muted:'Secondary text',button:'Buttons & accent',buttonText:'Button text',border:'Borders',header:'Container headers',input:'Form fields',buttonHover:'Button hover',buttonBorder:'Button border',active:'Active navigation',activeText:'Active navigation text',table:'Table rows',tableAlt:'Alternate rows',tableHeader:'Table headers',notice:'Notices',modal:'Dialogs',profileBorder:'Profile picture border',navBackground:'Normal background',navText:'Normal text',navHover:'Hover background',navHoverText:'Hover text',navBorder:'Navigation border',resultBorder:'Result summary border',scoreTrack:'Marks bar track',scoreFill:'Custom marks fill'};
 const defaults=dark=>({background:dark?'#0e1220':'#f8f9fe',container:dark?'#171d2e':'#ffffff',sidebar:dark?'#171d2e':'#ffffff',sidebarText:dark?'#f0f2fa':'#14161f',text:dark?'#f0f2fa':'#14161f',muted:dark?'#a9b4c9':'#677080',button:api.ACCENTS[current.accent],buttonText:'#ffffff',border:dark?'#303a52':'#e1e5ef',header:dark?'#171d2e':'#ffffff',input:dark?'#0e1220':'#f8f9fe',buttonHover:api.ACCENTS[current.accent],buttonBorder:api.ACCENTS[current.accent],active:api.ACCENTS[current.accent],activeText:'#ffffff',table:dark?'#171d2e':'#ffffff',tableAlt:dark?'#222b40':'#f0f2fb',tableHeader:dark?'#222b40':'#f0f2fb',notice:dark?'#222b40':'#f0f2fb',modal:dark?'#171d2e':'#ffffff',profileBorder:dark?'#303a52':'#e1e5ef',navBackground:dark?'#171d2e':'#ffffff',navText:dark?'#f0f2fa':'#14161f',navHover:dark?'#222b40':'#f0f2fb',navHoverText:dark?'#f0f2fa':'#14161f',navBorder:dark?'#303a52':'#e1e5ef',resultBorder:dark?'#303a52':'#e1e5ef',scoreTrack:dark?'#222b40':'#f0f2fb',scoreFill:current.colors.button||api.ACCENTS[current.accent]});
 const opacityNames={cardOpacity:'Cards & containers',sidebarOpacity:'Sidebar',buttonOpacity:'Buttons',fieldOpacity:'Form fields',tableOpacity:'Table rows',headerOpacity:'Container headers',noticeOpacity:'Notices',modalOpacity:'Dialogs',profileOpacity:'Academic profile',resultOpacity:'Result summary'};
 for(const [key,name] of Object.entries(opacityNames)){fields.push(key);const label=document.createElement('label');label.htmlFor=key;label.append(document.createTextNode(name));const output=document.createElement('output');output.id=key+'-value';const input=document.createElement('input');input.type='range';input.id=key;input.min='0';input.max='100';label.append(output,input);$('opacity-controls').append(label);}
 const media=matchMedia('(prefers-color-scheme: dark)');
 for(const [key,name] of Object.entries(names)){
  const row=document.createElement('div');row.className='color-row';
  const input=document.createElement('input');input.type='color';input.id='color-'+key;input.setAttribute('aria-label',name);
  const label=document.createElement('label');label.htmlFor=input.id;label.append(document.createTextNode(name));const code=document.createElement('small');code.id='code-'+key;label.append(code);
  const reset=document.createElement('button');reset.type='button';reset.textContent='↺';reset.setAttribute('aria-label','Reset '+name.toLowerCase());
  input.addEventListener('input',()=>update({colors:{...current.colors,[key]:input.value}}));
  reset.addEventListener('click',()=>{const colors={...current.colors};delete colors[key];update({colors});});row.append(input,label,reset);$(key==='profileBorder'?'profile-border-color':['active','activeText','navBackground','navText','navHover','navHoverText','navBorder'].includes(key)?'nav-colors':'colors').append(row);
 }
 function render(s){
  current=api.normalize(s);const dark=current.theme==='dark'||current.theme==='system'&&media.matches;
  document.documentElement.dataset.theme=dark?'dark':'light';
  document.querySelectorAll('[data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===current.theme)));
  for(const key of fields){const input=$(key);if(input.type==='checkbox')input.checked=current[key];else input.value=current[key];if($(key+'-value'))$(key+'-value').textContent=current[key]+((key.endsWith('Opacity')||key==='backgroundDim')?'%':' px');}
  const c={...defaults(dark),...current.colors};if(!current.colors.active)c.active=c.button;if(!current.colors.activeText)c.activeText=c.buttonText;if(!current.colors.navText)c.navText=c.sidebarText;
  for(const key of Object.keys(names)){$('color-'+key).value=c[key];$('code-'+key).textContent=current.colors[key]||'Automatic';}
  const photoPreview=document.querySelector('.profile-upload-preview');photoPreview.style.border=`${current.profileBorderWidth}px ${current.profileBorderStyle} ${c.profileBorder}`;photoPreview.style.borderRadius=current.profileBorderRadius+'px';
  const p=$('preview');const vars={bg:c.background,surface:current.glass?`color-mix(in srgb,${c.container} ${current.glassOpacity}%,transparent)`:c.container,sidebar:c.sidebar,'sidebar-text':c.sidebarText,text:c.text,muted:c.muted,button:c.button,'button-text':c.buttonText,border:c.border,radius:current.radius+'px',blur:(current.glass?current.glassBlur:0)+'px'};
  for(const [key,value] of Object.entries(vars))p.style.setProperty('--p-'+key,value);
  p.querySelector('.mini-sidebar').style.background=`color-mix(in srgb,${c.sidebar} ${current.sidebarOpacity}%,transparent)`;p.querySelectorAll('.mini-card').forEach(card=>card.style.background=`color-mix(in srgb,${c.container} ${current.cardOpacity*(current.glass?current.glassOpacity/100:1)}%,transparent)`);
  p.style.fontFamily=api.FONTS[current.font];p.style.fontSize=current.fontSize+'px';p.style.backgroundImage=current.background==='media'&&previewURL?`linear-gradient(#000${Math.round(current.backgroundDim*2.55).toString(16).padStart(2,'0')},#000${Math.round(current.backgroundDim*2.55).toString(16).padStart(2,'0')}),url("${previewURL}")`:'';
  p.style.backgroundSize=current.backgroundFit;p.style.backgroundPosition='center';p.style.backgroundRepeat='no-repeat';$('mode-label').textContent=dark?'DARK':'LIGHT';
  const navSample=p.querySelectorAll('.mini-sidebar span');navSample.forEach((item,index)=>{item.style.background=index===0?`color-mix(in srgb,${c.active} ${current.navActiveOpacity}%,transparent)`:current.colors.navBackground?`color-mix(in srgb,${c.navBackground} ${current.navOpacity}%,transparent)`:'transparent';item.style.color=index===0?c.activeText:c.navText;item.style.borderRadius=current.navRadius+'px';item.style.padding=Math.round(current.navPadding/2)+'px';item.style.border=`${current.navBorderWidth}px solid ${current.colors.navBorder||'transparent'}`;});
  const sample=$('sample-button');sample.style.borderRadius=current.buttonRadius+'px';sample.style.padding=current.buttonPadding+'px';sample.style.border='1px solid '+c.buttonBorder;sample.style.background=current.buttonStyle==='outline'?'transparent':current.buttonStyle==='soft'?`color-mix(in srgb,${c.button} 18%,transparent)`:c.button;if(current.buttonOpacity<100)sample.style.background=current.buttonStyle==='outline'?'transparent':`color-mix(in srgb,${c.button} ${current.buttonOpacity*(current.buttonStyle==='soft'?.18:1)}%,transparent)`;sample.style.color=current.buttonStyle==='filled'?c.buttonText:(current.colors.buttonText||c.text);
  const luminance=hex=>{const values=hex.slice(1).match(/../g).map(v=>{const n=parseInt(v,16)/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;});return values[0]*.2126+values[1]*.7152+values[2]*.0722;};
  const a=luminance(c.button),b=luminance(c.buttonText),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  $('contrast').textContent=ratio<4.5?'Button text may be hard to read. Try a lighter or darker text color.':'Button text contrast looks good.';
 }
 function update(patch){const next=api.normalize({...current,...patch});render(next);pending++;$('status').textContent='Saving…';queue=queue.catch(()=>{}).then(()=>api.set(next)).then(()=>{$('status').textContent='Saved · applied to your portal';}).catch(()=>{$('status').textContent='Could not save. Your last saved settings are still available.';}).finally(()=>{pending--;});return queue;}
 for(const key of fields)$(key).addEventListener('input',()=>update({[key]:typeof api.DEFAULTS[key]==='boolean'?$(key).checked:typeof api.DEFAULTS[key]==='number'?Number($(key).value):$(key).value}));
 document.querySelectorAll('[data-theme]').forEach(b=>b.addEventListener('click',()=>update({theme:b.dataset.theme})));
 $('editor').addEventListener('submit',e=>e.preventDefault());$('close').addEventListener('click',()=>parent.postMessage('cui-customizer-close','*'));
 async function fileInfo(){
  const file=await PortalMedia.get();
  $('file-name').textContent=file?`${file.name||'Local background'} · ${(file.size/1048576).toFixed(1)} MB`:'No background selected';
  if(previewURL)URL.revokeObjectURL(previewURL);previewURL=file?.type.startsWith('image/')?URL.createObjectURL(file):null;
  const profile=await PortalMedia.get('profile');if(profileURL)URL.revokeObjectURL(profileURL);profileURL=null;
  $('profile-file-name').textContent=profile?`${profile.name||'Custom profile picture'} · ${(profile.size/1048576).toFixed(1)} MB`:'Using university photo';
  $('profile-preview').hidden=!profile;$('profile-placeholder').hidden=!!profile;
  if(profile){profileURL=URL.createObjectURL(profile);$('profile-preview').src=profileURL;}else $('profile-preview').removeAttribute('src');
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
  const profile=key==='profile',input=$(profile?'profile-upload':'upload');if(!file||input.disabled)return;
  const types=['image/png','image/jpeg','image/webp','image/gif',...(profile?[]:['video/mp4','video/webm'])];
  const limit=profile?10:100;
  if(!types.includes(file.type)||file.size>limit*1048576||file.size===0){$('status').textContent=profile?'Choose a supported profile image under 10 MB.':'Choose a supported image or video under 100 MB.';input.value='';return;}
  input.disabled=true;$(profile?'profile-drop':'bg-drop').setAttribute('aria-busy','true');$('status').textContent=profile?'Saving local profile picture…':'Saving local background…';
  try{await validate(file);await PortalMedia.put(file,key);
   await update(profile?{customProfile:true,profileRevision:Date.now()}:{background:'media',mediaRevision:Date.now()});await fileInfo();
  }catch{$('status').textContent='Could not use this file. Check its format or available device storage.';}
  finally{input.disabled=false;input.value='';$(profile?'profile-drop':'bg-drop').removeAttribute('aria-busy');}
 }
 for(const [id,key] of [['upload','background'],['profile-upload','profile']])$(id).addEventListener('change',()=>uploadFile($(id).files[0],key));
 for(const [id,key] of [['bg-drop','background'],['profile-drop','profile']]){
  const zone=$(id);
  zone.addEventListener('dragenter',event=>{event.preventDefault();zone.setAttribute('data-dragging','');});
  zone.addEventListener('dragover',event=>{event.preventDefault();if(event.dataTransfer)event.dataTransfer.dropEffect='copy';});
  zone.addEventListener('dragleave',event=>{if(!zone.contains(event.relatedTarget))zone.removeAttribute('data-dragging');});
  zone.addEventListener('drop',event=>{event.preventDefault();event.stopPropagation();zone.removeAttribute('data-dragging');const files=event.dataTransfer?.files;
   if(files?.length!==1){$('status').textContent='Drop one file at a time.';return;}uploadFile(files[0],key);
  });
 }
 // Dropping a file elsewhere must not navigate away from the portal/editor.
 document.addEventListener('dragover',event=>event.preventDefault());document.addEventListener('drop',event=>event.preventDefault());
 $('remove-media').addEventListener('click',async()=>{try{await PortalMedia.remove();await update({background:'solid',mediaRevision:Date.now()});await fileInfo();}catch{$('status').textContent='Could not remove the background.';}});
 $('remove-profile').addEventListener('click',async()=>{try{await PortalMedia.remove('profile');await update({customProfile:false,profileRevision:Date.now()});await fileInfo();}catch{$('status').textContent='Could not restore the university photo.';}});
 $('reset').addEventListener('click',()=>{$('reset-confirm').hidden=false;});$('cancel-reset').addEventListener('click',()=>{$('reset-confirm').hidden=true;});
 $('confirm-reset').addEventListener('click',async()=>{try{await PortalMedia.remove();await PortalMedia.remove('profile');await update({...api.DEFAULTS,mediaRevision:Date.now(),profileRevision:Date.now()});await fileInfo();$('reset-confirm').hidden=true;}catch{$('status').textContent='Could not reset appearance.';}});

 async function themes(){
  const list=$('theme-list');list.replaceChildren();const collection=await PortalThemes.list();
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
 $('save-theme').addEventListener('click',async()=>{const button=$('save-theme');button.disabled=true;try{await queue;if(!$('theme-name').value.trim())throw new Error('Give your theme a name first.');await PortalThemes.save($('theme-name').value,current,current.background==='media'?await PortalMedia.get():null);await themes();$('theme-status').textContent='Current theme saved on this device.';}catch(error){$('theme-status').textContent=error.message;}finally{button.disabled=false;}});
 $('import-theme').addEventListener('change',async()=>{const file=$('import-theme').files[0];if(!file)return;$('import-theme').disabled=true;try{await PortalThemes.importTheme(file,validate);await themes();$('theme-status').textContent='Theme imported. Choose Apply when ready.';}catch(error){$('theme-status').textContent=error.message||'Could not import theme.';}finally{$('import-theme').disabled=false;$('import-theme').value='';}});
 await themes();
 api.subscribe(value=>{if(!pending)render(value);});media.addEventListener('change',()=>render(current));render(current);await fileInfo();$('status').textContent='Ready · all changes save automatically';
 addEventListener('pagehide',()=>{if(previewURL)URL.revokeObjectURL(previewURL);if(profileURL)URL.revokeObjectURL(profileURL);});
})().catch(()=>{document.getElementById('status').textContent='Could not load customization. Reload this page to try again.';});
