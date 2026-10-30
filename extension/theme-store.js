/* Named local themes. Files stay in IndexedDB; export is an explicit user download. */
(() => {
 const TYPES=['image/png','image/jpeg','image/webp','image/gif','video/mp4','video/webm'];
 const open=()=>new Promise((resolve,reject)=>{const r=indexedDB.open('cui-portal-themes',1);r.onupgradeneeded=()=>r.result.createObjectStore('themes',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 async function run(mode,action){const db=await open();try{return await new Promise((resolve,reject)=>{const t=db.transaction('themes',mode),r=action(t.objectStore('themes'));t.oncomplete=()=>resolve(r.result);t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error);});}finally{db.close();}}
 const cleanName=name=>String(name||'Imported theme').trim().slice(0,60)||'Imported theme';
 function settings(value){const clean=PortalSettings.normalize(value);return {...clean,enabled:true,customProfile:false,profileRevision:0,mediaRevision:0};}
 async function save(name,value,background){const all=await run('readonly',s=>s.getAll());if(all.length>=24)throw new Error('Your collection is full (24 themes). Delete one first.');const theme={id:crypto.randomUUID(),name:cleanName(name),settings:settings(value),background:background||null,created:Date.now()};await run('readwrite',s=>s.put(theme));return theme;}
 async function apply(theme){const current=await PortalSettings.get();if(theme.background)await PortalMedia.put(theme.background);else await PortalMedia.remove();return PortalSettings.set({...settings(theme.settings),enabled:true,background:theme.background?'media':'solid',mediaRevision:Date.now(),customProfile:current.customProfile,profileRevision:current.profileRevision});}
 const dataURL=blob=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(blob);});
 async function exportTheme(theme){const background=theme.background?{name:theme.background.name||'background',type:theme.background.type,data:await dataURL(theme.background)}:null;return JSON.stringify({format:'cui-portal-theme',version:1,name:theme.name,settings:settings(theme.settings),background},null,2);}
 async function importTheme(file,validate){
  if(file.size>145*1048576)throw new Error('Theme file is too large. Maximum 145 MB.');
  let input;try{input=JSON.parse(await file.text());}catch{throw new Error('This is not a valid theme JSON file.');}
  if(input?.format!=='cui-portal-theme'||input.version!==1||!input.settings||typeof input.settings!=='object'||Array.isArray(input.settings))throw new Error('Unsupported theme format or version.');
  let background=null;
  if(input.background){const b=input.background;if(!TYPES.includes(b.type)||typeof b.data!=='string'||!b.data.startsWith('data:'+b.type+';base64,'))throw new Error('Unsupported background in theme.');const encoded=b.data.slice(b.data.indexOf(',')+1);if(encoded.length>140*1048576||!/^[A-Za-z0-9+/]*={0,2}$/.test(encoded))throw new Error('Invalid background data.');let bytes;try{const raw=atob(encoded);if(raw.length>100*1048576)throw new Error();bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));}catch{throw new Error('Invalid or oversized background.');}background=new File([bytes],cleanName(b.name),{type:b.type});await validate(background);}
  return save(input.name,input.settings,background);
 }
 globalThis.PortalThemes={list:()=>run('readonly',s=>s.getAll()),save,apply,exportTheme,importTheme,remove:id=>run('readwrite',s=>s.delete(id)),rename:async(id,name)=>{const theme=await run('readonly',s=>s.get(id));if(!theme)throw new Error('Theme no longer exists.');theme.name=cleanName(name);return run('readwrite',s=>s.put(theme));}};
})();
