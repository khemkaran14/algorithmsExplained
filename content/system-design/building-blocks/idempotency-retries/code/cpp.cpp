#include <unordered_map>
#include <vector>
#include <string>
#include <utility>
struct Request{std::string key;int amount;std::string outcome;};std::pair<std::vector<Request>,std::vector<std::string>> apply(const std::vector<Request>& requests,bool atomic=true){std::unordered_map<std::string,int>saved;std::vector<Request>ledger;std::vector<std::string>responses;for(const auto& r:requests){auto previous=saved.find(r.key);if(previous!=saved.end()){responses.push_back(previous->second==r.amount?"replayed":"conflict");continue;}if(atomic&&r.outcome=="crash-between"){responses.push_back("rolled-back");continue;}ledger.push_back(r);if(r.outcome=="crash-between"){responses.push_back("effect-without-record");continue;}saved[r.key]=r.amount;responses.push_back(r.outcome=="response-lost"?"committed-response-lost":"ok");}
return {ledger,responses};}
