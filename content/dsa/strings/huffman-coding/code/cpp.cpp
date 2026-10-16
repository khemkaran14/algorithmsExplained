#include <string>
#include <map>
#include <memory>
#include <queue>
#include <vector>
#include <functional>
struct N{int freq,id;int ch;std::shared_ptr<N>left,right;};struct Later{bool operator()(const std::shared_ptr<N>&a,const std::shared_ptr<N>&b)const{return a->freq>b->freq||(a->freq==b->freq&&a->id>b->id);}};
std::map<char,std::string> huffman(const std::string& text){std::map<char,int>freq;for(char ch:text)freq[ch]++;std::priority_queue<std::shared_ptr<N>,std::vector<std::shared_ptr<N>>,Later>q;int id=0;for(auto [ch,count]:freq)q.push(std::make_shared<N>(N{count,id++,ch,nullptr,nullptr}));while(q.size()>1){auto a=q.top();q.pop();auto b=q.top();q.pop();q.push(std::make_shared<N>(N{a->freq+b->freq,id++,-1,a,b}));}std::map<char,std::string>out;std::function<void(std::shared_ptr<N>,std::string)>visit=[&](auto n,auto p){if(n->ch>=0)out[char(n->ch)]=p.empty()?"0":p;else{visit(n->left,p+"0");visit(n->right,p+"1");}};visit(q.top(),"");return out;}
