// Version/delete core; conditional tokens and archive-expiry checks surround this state.
class ObjectVersions {
  constructor(provider){this.provider=provider;this.versions=[];this.live=null;this.serial=0;}
  put(value){const v={id:++this.serial,value,marker:false};this.versions.push(v);this.live=v.id;return v.id;}
  remove(){if(this.provider==='aws'){const v={id:++this.serial,value:null,marker:true};this.versions.push(v);this.live=v.id;}else this.live=null;}
  removeVersion(id){const wasLive=this.live===id;this.versions=this.versions.filter(v=>v.id!==id);if(wasLive)this.live=this.provider==='aws'?(this.versions.at(-1)?.id??null):null;}
  get(){const v=this.versions.find(v=>v.id===this.live);return !v||v.marker?null:v.value;}
}
