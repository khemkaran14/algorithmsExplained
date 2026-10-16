#include <vector>
#include <map>
#include <string>
struct Order{int id,customerId;std::string address;};struct Outcome{bool committed;int copies;};
Outcome update(std::map<int,std::string>&profile,std::vector<Order>&orders,int id,const std::string&address,bool atomic=false,int failAfter=-1){std::vector<Order*>targets;for(auto&row:orders)if(row.customerId==id)targets.push_back(&row);bool fails=failAfter>=0&&failAfter<int(targets.size());if(atomic&&fails)return {false,0};profile[id]=address;int copies=0;for(auto row:targets){if(fails&&copies>=failAfter)break;row->address=address;copies++;}return {!fails,copies};}
std::pair<std::string,bool> read(const std::map<int,std::string>&profile,const Order&order,bool normalized=false){auto truth=profile.at(order.customerId),address=normalized?truth:order.address;return {address,address!=truth};}
void repair(const std::map<int,std::string>&profile,std::vector<Order>&orders){for(auto&row:orders)row.address=profile.at(row.customerId);}
// Deterministic local fan-out experiment; real atomicity requires transactional persistence.
