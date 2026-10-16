#include <vector>
#include <set>
#include <string>
#include <algorithm>
struct FD{std::set<std::string>left,right;};bool contains(const std::set<std::string>&a,const std::set<std::string>&b){return std::includes(a.begin(),a.end(),b.begin(),b.end());}
std::set<std::string> closure(std::set<std::string>out,const std::vector<FD>&fds){bool changed=true;while(changed){changed=false;for(const auto& fd:fds)if(contains(out,fd.left))for(const auto&a:fd.right)if(out.insert(a).second)changed=true;}return out;}
struct Report{std::vector<std::set<std::string>>keys;std::set<std::string>prime;bool second=true,third=true,bcnf=true;};
Report analyze(const std::vector<std::string>&attrs,const std::vector<FD>&fds){Report r;std::set<std::string>all(attrs.begin(),attrs.end());for(unsigned mask=0;mask<(1u<<attrs.size());mask++){std::set<std::string>subset;for(unsigned i=0;i<attrs.size();i++)if(mask&(1u<<i))subset.insert(attrs[i]);bool minimal=true;for(const auto&k:r.keys)if(contains(subset,k))minimal=false;if(minimal&&contains(closure(subset,fds),all))r.keys.push_back(subset);}for(const auto&k:r.keys)r.prime.insert(k.begin(),k.end());for(auto fd:fds)if(!contains(closure(fd.left,fds),all))for(auto a:fd.right)if(!fd.left.count(a)){r.bcnf=false;if(!r.prime.count(a))r.third=false;}for(auto key:r.keys){std::vector<std::string>list(key.begin(),key.end());for(unsigned mask=0;mask<(1u<<list.size())-1;mask++){std::set<std::string>subset;for(unsigned i=0;i<list.size();i++)if(mask&(1u<<i))subset.insert(list[i]);for(auto a:closure(subset,fds))if(!r.prime.count(a))r.second=false;}}r.third=r.third&&r.second;return r;}
// Exponential bounded key enumeration, not dependency inference from example rows.
