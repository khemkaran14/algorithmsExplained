#include <vector>
#include <optional>
#include <string>
#include <cstdint>
#include <utility>
std::vector<std::optional<std::string>> generate(const std::vector<int>& workers,const std::vector<std::pair<int,int>>& events,bool logicalWait=false){std::vector<int>last(workers.size(),-1),seq(workers.size());std::vector<std::optional<std::string>>out;for(auto [worker,observed]:events){int time=observed;if(time<last[worker]){if(!logicalWait){out.push_back(std::nullopt);continue;}time=last[worker];}int next=time==last[worker]?seq[worker]+1:0;if(next>=16){if(!logicalWait){out.push_back(std::nullopt);continue;}time=last[worker]+1;next=0;}last[worker]=time;seq[worker]=next;uint64_t id=(uint64_t(time)<<7)|(uint64_t(workers[worker])<<4)|next;out.push_back(std::to_string(id));}return out;}
