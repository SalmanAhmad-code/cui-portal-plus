(() => {
 let url,revision=-1,ticket=0;
 async function apply(settings){
  if(!settings.customProfile){ticket++;revision=-1;parent.postMessage('cui-profile-photo-empty','*');return;}
  if(revision===settings.profileRevision)return;
  const request=++ticket;
  revision=settings.profileRevision;parent.postMessage('cui-profile-photo-empty','*');
  const file=await PortalMedia.get('profile').catch(()=>null);if(request!==ticket)return;
  revision=settings.profileRevision;
  if(url)URL.revokeObjectURL(url);url=null;
  const img=document.getElementById('photo');
  if(!file){img.removeAttribute('src');parent.postMessage('cui-profile-photo-empty','*');return;}
  url=URL.createObjectURL(file);
  img.onload=()=>{if(request===ticket)parent.postMessage('cui-profile-photo-ready','*');};
  img.onerror=()=>{if(request===ticket)parent.postMessage('cui-profile-photo-empty','*');};
  img.src=url;
 }
 PortalSettings.subscribe(apply);PortalSettings.get().then(apply);
 addEventListener('pagehide',()=>{if(url)URL.revokeObjectURL(url);});
})();
