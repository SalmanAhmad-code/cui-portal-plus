/* Adapt legacy light surfaces by computed presentation only. No text, field values,
   records, credentials or network data are read. Scope: SIS content and dialogs. */
(() => {
  'use strict';
  const classes=['cp-dark-surface','cp-dark-ink','cp-dark-blue','cp-dark-red','cp-dark-amber'];
  const tracked=new Set();
  let pending=false;
  function rgb(value){
    const match=value?.match(/^rgba?\(([^)]+)\)/i);
    if(!match)return null;
    const n=match[1].match(/[\d.]+/g)?.map(Number);
    return n?.length>=3?{r:n[0],g:n[1],b:n[2],a:n[3]??1}:null;
  }
  function luminance(c){const lin=v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;};return .2126*lin(c.r)+.7152*lin(c.g)+.0722*lin(c.b);}
  function pastel(c){return c&&c.a>.8&&luminance(c)>.35&&Math.max(c.r,c.g,c.b)-Math.min(c.r,c.g,c.b)<85;}
  function clear(){for(const node of tracked)node.classList.remove(...classes);tracked.clear();}
  function mark(node,name){node.classList.add(name);tracked.add(node);}
  function scan(){
    pending=false;clear();
    if(document.documentElement.getAttribute('data-cui-plus')!=='dark')return;
    const scopes=[...document.querySelectorAll('#main-content,#cboxContent')];
    const snapshot=[];
    for(const scope of scopes)for(const node of [scope,...scope.querySelectorAll('*')]){
      if(node.matches('script,style,img,canvas,svg,svg *,input,select,textarea,option,button'))continue;
      const style=getComputedStyle(node);
      const background=rgb(style.backgroundColor);
      const gradientColors=style.backgroundImage.startsWith('linear-gradient')||style.backgroundImage.startsWith('radial-gradient') ? [...style.backgroundImage.matchAll(/rgba?\([^)]+\)/g)].map(m=>rgb(m[0])) : [];
      snapshot.push({node,background,color:rgb(style.color),light:pastel(background)||(gradientColors.length>0&&gradientColors.every(pastel))});
    }
    const snapshots=new Map(snapshot.map(item=>[item.node,item]));
    for(const item of snapshot)if(item.light)mark(item.node,'cp-dark-surface');
    // Text on intentionally saturated swatches keeps its original contrast and meaning.
    for(const {node,color} of snapshot){
      if(!color||color.a<.8)continue;
      let coloredBackdrop=false;
      for(let ancestor=node;ancestor&&snapshots.has(ancestor);ancestor=ancestor.parentElement){
        const item=snapshots.get(ancestor);
        if(item.background&&item.background.a>.8){
          if(!item.light&&luminance(item.background)>.22&&Math.max(item.background.r,item.background.g,item.background.b)-Math.min(item.background.r,item.background.g,item.background.b)>=85)coloredBackdrop=true;
          break;
        }
      }
      if(coloredBackdrop)continue;
      // The dark surface is #171d2e; only replace colors with inadequate contrast.
      const contrast=(Math.max(luminance(color),.0127)+.05)/(Math.min(luminance(color),.0127)+.05);
      if(contrast>=4.5)continue;
      if(color.b>color.r*1.35&&color.b>color.g*1.1)mark(node,'cp-dark-blue');
      else if(color.r>color.g*1.4&&color.r>color.b*1.2)mark(node,'cp-dark-red');
      else if(color.r>color.g&&color.g>color.b*1.3)mark(node,'cp-dark-amber');
      else mark(node,'cp-dark-ink');
    }
  }
  function schedule(){if(!pending){pending=true;requestAnimationFrame(scan);}}
  function start(){
    new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['data-cui-plus']});
    new MutationObserver(records=>{if(records.some(record=>!record.target.matches?.('canvas,svg,svg *')))schedule();}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style','bgcolor','color']});
    window.addEventListener('load',schedule,{once:true});
    window.addEventListener('afterprint',schedule);
    schedule();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
