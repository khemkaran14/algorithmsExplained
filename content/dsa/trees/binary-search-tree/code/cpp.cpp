#include <algorithm>
struct N {int k,h=1;bool red=true;N *l=nullptr,*r=nullptr;explicit N(int k):k(k){}};
// The caller owns the nodes; free them after the demonstration.
int height(N* n){return n?n->h:0;}N* fix(N* n){n->h=1+std::max(height(n->l),height(n->r));return n;}
N* left(N* h){N* x=h->r;h->r=x->l;x->l=h;x->red=h->red;h->red=true;fix(h);return fix(x);}N* right(N* h){N* x=h->l;h->l=x->r;x->r=h;x->red=h->red;h->red=true;fix(h);return fix(x);}bool red(N* n){return n&&n->red;}
N* insert(N* h,int k){if(!h)return new N(k);if(k<h->k)h->l=insert(h->l,k);else if(k>h->k)h->r=insert(h->r,k);else return h;fix(h);
return fix(h);}void add(N*& root,int k){root=insert(root,k);root->red=false;}
bool has(N* n,int k){while(n){if(n->k==k)return true;n=k<n->k?n->l:n->r;}return false;}N* remove(N* n,int k){if(!n)return nullptr;if(k<n->k)n->l=remove(n->l,k);else if(k>n->k)n->r=remove(n->r,k);else{if(!n->l){N* r=n->r;delete n;return r;}if(!n->r){N* l=n->l;delete n;return l;}N* s=n->r;while(s->l)s=s->l;n->k=s->k;n->r=remove(n->r,s->k);}return fix(n);}

