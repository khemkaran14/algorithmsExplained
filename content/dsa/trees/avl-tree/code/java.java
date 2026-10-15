class Tree {static class N{int k,h=1;N l,r;boolean red=true;N(int k){this.k=k;}}N root;int height(N n){return n==null?0:n.h;}N fix(N n){n.h=1+Math.max(height(n.l),height(n.r));return n;}
N left(N h){N x=h.r;h.r=x.l;x.l=h;x.red=h.red;h.red=true;fix(h);return fix(x);}N right(N h){N x=h.l;h.l=x.r;x.r=h;x.red=h.red;h.red=true;fix(h);return fix(x);}
boolean red(N n){return n!=null&&n.red;}
N insert(N h,int k){if(h==null)return new N(k);if(k<h.k)h.l=insert(h.l,k);else if(k>h.k)h.r=insert(h.r,k);else return h;fix(h);
int b=height(h.l)-height(h.r);if(b>1){if(k>h.l.k)h.l=left(h.l);h=right(h);}else if(b < -1){if(k<h.r.k)h.r=right(h.r);h=left(h);}
return fix(h);}void add(int k){root=insert(root,k);root.red=false;}
}
