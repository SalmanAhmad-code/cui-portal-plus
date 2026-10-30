/* Local extension-origin IndexedDB; files never leave the device. */
(() => {
  const open=()=>new Promise((resolve,reject)=>{
    const request=indexedDB.open('cui-portal-media',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('files');
    request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
  });
  async function run(mode,action){
    const db=await open();
    try{return await new Promise((resolve,reject)=>{
      const tx=db.transaction('files',mode);const request=action(tx.objectStore('files'));
      tx.oncomplete=()=>resolve(request.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
    });}finally{db.close();}
  }
  const keyOf=key=>{if(!['background','profile'].includes(key))throw new Error('Invalid media key');return key;};
  globalThis.PortalMedia={get:(key='background')=>run('readonly',s=>s.get(keyOf(key))),put:(file,key='background')=>run('readwrite',s=>s.put(file,keyOf(key))),remove:(key='background')=>run('readwrite',s=>s.delete(keyOf(key)))};
})();
