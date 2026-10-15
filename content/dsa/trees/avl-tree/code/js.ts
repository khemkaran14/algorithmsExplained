class Tree {constructor(){this.root=null;} height(n){return n?n.h:0;} fix(n){n.h=1+Math.max(this.height(n.l),this.height(n.r));return n;}
left(h){const x=h.r;h.r=x.l;x.l=h;x.red=h.red;h.red=true;this.fix(h);return this.fix(x);}right(h){const x=h.l;h.l=x.r;x.r=h;x.red=h.red;h.red=true;this.fix(h);return this.fix(x);}
insert(h,k){if(!h)return {k,l:null,r:null,h:1,red:true};if(k<h.k)h.l=this.insert(h.l,k);else if(k>h.k)h.r=this.insert(h.r,k);else return h;this.fix(h);
const b=this.height(h.l)-this.height(h.r);if(b>1){if(k>h.l.k)h.l=this.left(h.l);h=this.right(h);}else if(b < -1){if(k<h.r.k)h.r=this.right(h.r);h=this.left(h);}
return this.fix(h);}add(k){this.root=this.insert(this.root,k);this.root.red=false;}
}
