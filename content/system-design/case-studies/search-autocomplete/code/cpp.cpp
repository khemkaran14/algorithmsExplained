#include <map>
#include <vector>
#include <string>
#include <algorithm>
#include <memory>
struct Term{std::string word;int frequency;};struct Node{std::map<char,std::unique_ptr<Node>>children;int term=-1;};
void collect(const Node& n,const std::vector<Term>&dict,std::vector<Term>&out){if(n.term>=0)out.push_back(dict[n.term]);for(const auto& [ch,child]:n.children)collect(*child,dict,out);}
std::vector<Term> suggest(const std::vector<Term>&dict,const std::string& prefix,unsigned k){Node root;for(unsigned i=0;i<dict.size();i++){Node* n=&root;for(char ch:dict[i].word){auto& p=n->children[ch];if(!p)p=std::make_unique<Node>();n=p.get();}n->term=i;}Node* n=&root;for(char ch:prefix){auto it=n->children.find(ch);if(it==n->children.end())return {};n=it->second.get();}std::vector<Term>out;collect(*n,dict,out);std::sort(out.begin(),out.end(),[](const Term&a,const Term&b){return a.frequency!=b.frequency?a.frequency>b.frequency:a.word<b.word;});if(out.size()>k)out.resize(k);return out;}
