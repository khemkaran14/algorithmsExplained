class PageTree {constructor(plus=false){this.plus=plus;this.root={keys:[],children:[]};this.seen=new Set();}
insert(p,k){let i=0;while(i<p.keys.length&&(k>p.keys[i]||(this.plus&&k===p.keys[i])))i++;if(p.children.length){const split=this.insert(p.children[i],k);if(split){p.keys.splice(i,0,split.key);p.children.splice(i+1,0,split.right);}}else p.keys.splice(i,0,k);if(p.keys.length<=3)return null;
if(this.plus&&!p.children.length){const right={keys:p.keys.splice(2),children:[],next:p.next};p.next=right;return {key:right.keys[0],right};}
const key=p.keys[2],right={keys:p.keys.splice(3),children:p.children.splice(3)};p.keys.splice(2,1);return {key,right};}
add(k){if(this.seen.has(k))return;this.seen.add(k);const split=this.insert(this.root,k);if(split)this.root={keys:[split.key],children:[this.root,split.right]};}
has(k){let p=this.root;while(true){let i=0;while(i<p.keys.length&&k>p.keys[i])i++;if(!p.children.length)return p.keys.includes(k);if(p.keys[i]===k){if(!this.plus)return true;i++;}p=p.children[i];}}}
