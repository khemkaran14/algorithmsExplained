#include <string>
#include <vector>
#include <map>
#include <set>
#include <algorithm>
struct URL{std::string canonical,host,path;};
URL parse(std::string s){s=s.substr(0,s.find('#'));auto begin=s.find("://")+3,end=s.find_first_of("/?",begin);std::string host=s.substr(begin,end-begin),path=end==std::string::npos?"/":s[end]=='?'?"/":s.substr(end,s.find('?',end)-end);if(end==std::string::npos)s+="/";else if(s[end]=='?')s.insert(end,"/");return {s,host,path};}
struct Event{int tick;std::string url,status;};struct Result{std::vector<Event>history;std::vector<std::string>pending;unsigned discovered;};
Result crawl(const std::map<std::string,std::vector<std::string>>&graph,const std::vector<std::string>&seeds,const std::map<std::string,std::vector<std::string>>&robots,int delay=2,int workers=2,int ticks=12){std::set<std::string>seen;std::vector<std::string>frontier;for(auto s:seeds){auto u=parse(s);if(seen.insert(u.canonical).second)frontier.push_back(u.canonical);}std::map<std::string,int>next;std::vector<Event>history;for(int tick=0;tick<ticks;tick++){int budget=workers;while(budget>0){auto it=std::find_if(frontier.begin(),frontier.end(),[&](auto s){return next[parse(s).host]<=tick;});if(it==frontier.end())break;auto u=parse(*it);frontier.erase(it);bool blocked=false;auto policy=robots.find(u.host);if(policy!=robots.end())for(auto prefix:policy->second)if(u.path.rfind(prefix,0)==0)blocked=true;if(blocked){history.push_back({tick,u.canonical,"blocked"});continue;}budget--;next[u.host]=tick+delay;auto links=graph.find(u.canonical);history.push_back({tick,u.canonical,links==graph.end()?"missing":"visited"});if(links!=graph.end())for(auto raw:links->second){auto value=parse(raw).canonical;if(seen.insert(value).second)frontier.push_back(value);}}}return {history,frontier,unsigned(seen.size())};}
// Restricted teaching parser for validated simple HTTP(S) URLs, not a general URL library. No network I/O.
