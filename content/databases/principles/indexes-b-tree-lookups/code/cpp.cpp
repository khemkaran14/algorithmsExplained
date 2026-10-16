#include <vector>
#include <memory>
#include <optional>
#include <set>
#include <algorithm>
class PageTree {struct P{std::vector<int> keys;std::vector<std::shared_ptr<P>> children;std::weak_ptr<P> next;};struct Split{int key;std::shared_ptr<P> right;};bool plus;std::shared_ptr<P> root=std::make_shared<P>();std::set<int> seen;
std::optional<Split> insert(std::shared_ptr<P> p,int k){unsigned i=0;while(i<p->keys.size()&&(k>p->keys[i]||(plus&&k==p->keys[i])))i++;if(!p->children.empty()){auto s=insert(p->children[i],k);if(s){p->keys.insert(p->keys.begin()+i,s->key);p->children.insert(p->children.begin()+i+1,s->right);}}else p->keys.insert(p->keys.begin()+i,k);if(p->keys.size()<=3)return std::nullopt;auto r=std::make_shared<P>();if(plus&&p->children.empty()){r->keys.assign(p->keys.begin()+2,p->keys.end());p->keys.resize(2);r->next=p->next;p->next=r;return Split{r->keys[0],r};}int key=p->keys[2];r->keys.assign(p->keys.begin()+3,p->keys.end());p->keys.resize(2);if(!p->children.empty()){r->children.assign(p->children.begin()+3,p->children.end());p->children.resize(3);}return Split{key,r};}
public:explicit PageTree(bool plus=false):plus(plus){}void add(int k){if(!seen.insert(k).second)return;auto s=insert(root,k);if(s){auto p=std::make_shared<P>();p->keys={s->key};p->children={root,s->right};root=p;}}
bool has(int k)const{auto p=root;while(true){unsigned i=0;while(i<p->keys.size()&&k>p->keys[i])i++;if(p->children.empty())return std::find(p->keys.begin(),p->keys.end(),k)!=p->keys.end();if(i<p->keys.size()&&p->keys[i]==k){if(!plus)return true;i++;}p=p->children[i];}}};
