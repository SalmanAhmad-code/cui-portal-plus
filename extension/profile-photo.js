/* Decorative local replacement only. Original photo URL and handlers are retained. */
(() => {
 const base=globalThis.chrome?.runtime?.id?chrome.runtime.getURL(''):new URL('.',document.currentScript.src).href;
 const records=new Set();let settings=PortalSettings.normalize(null),pending=false;
 function clear(record){record.frame.remove();record.photo.classList.remove('cp-original-photo');if(record.wrap.parentNode)record.wrap.replaceWith(record.photo);records.delete(record);}
 function apply(){
  pending=false;
  const blocked=/^(Just a moment|Attention Required)/i.test(document.title)||document.querySelector('#challenge-running,#challenge-stage,.cf-turnstile');
  for(const record of [...records])if(!settings.enabled||!settings.customProfile||blocked||!record.wrap.isConnected)clear(record);
  if(!settings.enabled||!settings.customProfile||blocked)return;
  for(const photo of document.querySelectorAll('#divStudentDetails #stImg')){
   if([...records].some(r=>r.photo===photo))continue;
   const wrap=document.createElement('span');wrap.className='cp-photo-wrap';
   photo.before(wrap);wrap.append(photo);photo.classList.add('cp-original-photo');
   const frame=document.createElement('iframe');frame.src=base+'profile-photo.html';frame.className='cp-custom-photo';frame.title='Custom profile picture';frame.tabIndex=-1;frame.setAttribute('aria-hidden','true');wrap.append(frame);
   records.add({photo,wrap,frame});
  }
 }
 function schedule(){if(!pending){pending=true;requestAnimationFrame(apply);}}
 addEventListener('message',event=>{for(const record of records)if(event.source===record.frame.contentWindow){if(event.data==='cui-profile-photo-ready')record.wrap.classList.add('cp-photo-ready');else if(event.data==='cui-profile-photo-empty')record.wrap.classList.remove('cp-photo-ready');}});
 PortalSettings.subscribe(value=>{settings=value;schedule();});PortalSettings.get().then(value=>{settings=value;schedule();});
 function start(){new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});schedule();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
