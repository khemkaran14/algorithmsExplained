#include <map>
#include <set>
#include <vector>
#include <string>
#include <algorithm>
struct Request{std::string tx,key,mode;};using Holders=std::map<std::string,std::map<std::string,std::string>>;using Edge=std::pair<std::string,std::string>;
std::set<std::string> blockers(const Request&r,const Holders&holders,const std::vector<Request>&earlier){auto it=holders.find(r.key);std::set<std::string>out;if(it!=holders.end()){auto own=it->second.find(r.tx);if(own!=it->second.end()&&(own->second=="X"||(own->second=="S"&&r.mode=="S")))return {};for(auto [owner,mode]:it->second)if(owner!=r.tx&&(r.mode=="X"||mode=="X"))out.insert(owner);}for(auto p:earlier)if(p.key==r.key&&p.tx!=r.tx&&(r.mode=="X"||p.mode=="X"))out.insert(p.tx);return out;}
std::vector<Edge> graph(const Holders&holders,const std::vector<Request>&queue){std::vector<Edge>out;for(unsigned i=0;i<queue.size();i++)for(auto to:blockers(queue[i],holders,std::vector<Request>(queue.begin(),queue.begin()+i)))out.push_back({queue[i].tx,to});return out;}
std::string visit(std::string n,const std::vector<Edge>&edges,std::vector<std::string>&active,std::set<std::string>&done){auto it=std::find(active.begin(),active.end(),n);if(it!=active.end())return *std::max_element(it,active.end());if(done.count(n))return "";active.push_back(n);for(auto [from,to]:edges)if(from==n){auto found=visit(to,edges,active,done);if(!found.empty())return found;}active.pop_back();done.insert(n);return "";}
std::string victim(const std::vector<Edge>&edges){std::vector<std::string>active;std::set<std::string>done;for(std::string n:{"A","B","C"}){auto found=visit(n,edges,active,done);if(!found.empty())return found;}return "";}
// Only the compatibility/wait graph/cycle core; the player also executes releases and wakeups.
