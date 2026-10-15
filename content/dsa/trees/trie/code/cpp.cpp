#include <map>
#include <memory>
#include <string>
class Trie {struct N{bool end=false;std::map<char,std::unique_ptr<N>> next;};N root;public:void add(const std::string& word){N* n=&root;for(char ch:word){auto& child=n->next[ch];if(!child)child=std::make_unique<N>();n=child.get();}n->end=true;}
bool has(const std::string& query,bool prefix=false)const{const N* n=&root;for(char ch:query){auto i=n->next.find(ch);if(i==n->next.end())return false;n=i->second.get();}
return prefix||n->end;}};
