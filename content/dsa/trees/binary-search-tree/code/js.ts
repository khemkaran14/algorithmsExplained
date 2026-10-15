class Tree {constructor(){this.root=null;} height(n){return n?n.h:0;} fix(n){n.h=1+Math.max(this.height(n.l),this.height(n.r));return n;}
left(h){const x=h.r;h.r=x.l;x.l=h;x.red=h.red;h.red=true;this.fix(h);return this.fix(x);}right(h){const x=h.l;h.l=x.r;x.r=h;x.red=h.red;h.red=true;this.fix(h);return this.fix(x);}
insert(h,k){if(!h)return {k,l:null,r:null,h:1,red:true};if(k<h.k)h.l=this.insert(h.l,k);else if(k>h.k)h.r=this.insert(h.r,k);else return h;this.fix(h);
return this.fix(h);}add(k){this.root=this.insert(this.root,k);this.root.red=false;}
has(k){let n=this.root;while(n){if(n.k===k)return true;n=k<n.k?n.l:n.r;}return false;}remove(n,k){if(!n)return null;if(k<n.k)n.l=this.remove(n.l,k);else if(k>n.k)n.r=this.remove(n.r,k);else{if(!n.l)return n.r;if(!n.r)return n.l;let s=n.r;while(s.l)s=s.l;n.k=s.k;n.r=this.remove(n.r,s.k);}return this.fix(n);}delete(k){this.root=this.remove(this.root,k);}
}
