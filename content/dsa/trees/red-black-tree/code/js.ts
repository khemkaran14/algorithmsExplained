class Tree {constructor(){this.root=null;} height(n){return n?n.h:0;} fix(n){n.h=1+Math.max(this.height(n.l),this.height(n.r));return n;}
left(h){const x=h.r;h.r=x.l;x.l=h;x.red=h.red;h.red=true;this.fix(h);return this.fix(x);}right(h){const x=h.l;h.l=x.r;x.r=h;x.red=h.red;h.red=true;this.fix(h);return this.fix(x);}
insert(h,k){if(!h)return {k,l:null,r:null,h:1,red:true};if(k<h.k)h.l=this.insert(h.l,k);else if(k>h.k)h.r=this.insert(h.r,k);else return h;this.fix(h);
if(h.r?.red&&!h.l?.red)h=this.left(h);if(h.l?.red&&h.l.l?.red)h=this.right(h);if(h.l?.red&&h.r?.red){h.red=!h.red;h.l.red=!h.l.red;h.r.red=!h.r.red;}
return this.fix(h);}add(k){this.root=this.insert(this.root,k);this.root.red=false;}
}
