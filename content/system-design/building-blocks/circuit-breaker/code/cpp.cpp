#include <vector>
#include <string>
#include <utility>
struct Result{int at;bool called;std::string state;};std::vector<Result> breaker(const std::vector<std::pair<int,bool>>& events,int threshold=2,int cooldown=1000){std::string state="closed";int failures=0,retryAt=0;std::vector<Result>out;for(auto [at,success]:events){if(state=="open"&&at>=retryAt)state="half-open";bool called=state!="open";if(called){if(success){state="closed";failures=0;}else if(++failures>=threshold||state=="half-open"){state="open";retryAt=at+cooldown;}}out.push_back({at,called,state});}
// No call outcome is consumed for an open-circuit rejection.
return out;}
