class Links {
constructor(){this.next=1;this.links=new Map();this.keys=new Map();}
create(key,url){if(this.keys.has(key)){const old=this.keys.get(key);if(old.url!==url)throw Error('key conflict');return old.code;}
const alphabet='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';let n=this.next++,code='';do{code=alphabet[n%62]+code;n=Math.floor(n/62);}while(n);code=code.padStart(3,'0');
if(this.links.has(code))throw Error('unique constraint');this.links.set(code,{url,active:true});this.keys.set(key,{url,code});return code;}
resolve(code){const row=this.links.get(code);return row?.active?row.url:null;}
revoke(code){const row=this.links.get(code);if(row)row.active=false;}
} // Persist counter, unique link and scoped request key atomically in a real service.
