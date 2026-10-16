#include <vector>
#include <map>
#include <algorithm>
#include <utility>
struct Commit{int leader,term,votes;};std::pair<std::vector<Commit>,int> quorumRound(int configured,const std::vector<std::vector<int>>& components,std::map<int,int>& leaders,std::map<std::vector<int>,int>& missing,int tick,int timeout,int nextTerm){int quorum=configured/2+1;std::vector<Commit>commits;for(const auto& group:components){std::vector<int>known;for(int n:group)if(leaders.count(n))known.push_back(n);std::sort(known.begin(),known.end(),[&](int a,int b){return leaders[a]!=leaders[b]?leaders[a]>leaders[b]:a<b;});for(unsigned i=1;i<known.size();i++)leaders.erase(known[i]);int leader=known.empty()?-1:known[0];if(leader==-1){if(!missing.count(group))missing[group]=tick;if((int)group.size()>=quorum&&tick-missing[group]>=timeout){leader=*std::min_element(group.begin(),group.end());leaders[leader]=++nextTerm;missing.erase(group);}}else missing.erase(group);if(leader!=-1&&(int)group.size()>=quorum)commits.push_back({leader,leaders[leader],int(group.size())});}
return {commits,nextTerm};}
