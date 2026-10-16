#include <string>
#include <vector>
#include <map>
#include <tuple>
#include <stdexcept>
struct Event{std::string id,kind;int amount;std::string currency;};struct Payment{std::string state="created";int captured=0,refunded=0;bool entitled=false;std::vector<std::pair<std::string,int>>ledger;};
Payment apply(const std::vector<Event>&events,int price,std::string currency="INR"){Payment p;std::map<std::string,std::tuple<std::string,int,std::string>>seen;for(auto e:events){auto payload=std::make_tuple(e.kind,e.amount,e.currency);if(seen.count(e.id)){if(seen.at(e.id)!=payload)throw std::invalid_argument("event-conflict");continue;}if(e.currency!=currency)continue;if(e.kind=="capture"){if(e.amount!=price)continue;if(!p.captured){p.captured=e.amount;p.state="captured";p.ledger.push_back({"provider",e.amount});p.ledger.push_back({"liability",-e.amount});}}else if(e.kind=="refund"){if(!p.captured||e.amount>p.captured-p.refunded)continue;p.refunded+=e.amount;p.state=p.refunded==p.captured?"refunded":"partially-refunded";p.ledger.push_back({"provider",-e.amount});p.ledger.push_back({"liability",e.amount});}else if(!p.captured)p.state="failed";seen[e.id]=payload;}p.entitled=p.captured>0&&!p.refunded;return p;}
// Trusted validated positive integer events; persistence/transport authentication are external.
