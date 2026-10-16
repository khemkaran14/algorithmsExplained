#include <vector>
#include <set>
#include <string>
#include <optional>
struct Customer{int id;std::string name;};struct Order{int id;std::optional<int>customerId;int amount;};struct Row{std::optional<int>customerId;std::optional<std::string>customerName;std::optional<int>orderId,amount;};
std::vector<Row> join(const std::vector<Customer>&customers,const std::vector<Order>&orders,const std::string& kind="left"){std::vector<Row>out;std::set<unsigned>matched;for(auto c:customers){bool found=false;for(unsigned i=0;i<orders.size();i++){auto o=orders[i];if(o.customerId&&*o.customerId==c.id){found=true;matched.insert(i);out.push_back({c.id,c.name,o.id,o.amount});}}if(!found&&(kind=="left"||kind=="full"))out.push_back({c.id,c.name,{},{}});}if(kind=="right"||kind=="full")for(unsigned i=0;i<orders.size();i++)if(!matched.count(i)){auto o=orders[i];out.push_back({{},{},o.id,o.amount});}return out;}
// SQL bag semantics; an empty optional never matches a key.
#include <map>
#include <algorithm>
struct Group{int customerId;std::string name;int total=0,count=0;};
std::vector<Group> query(const std::vector<Customer>&customers,const std::vector<Order>&orders,int minAmount,int havingTotal,unsigned limit){std::map<std::pair<int,std::string>,Group>groups;for(auto r:join(customers,orders,"left")){if(!r.amount||*r.amount<minAmount)continue;auto key=std::make_pair(*r.customerId,*r.customerName);auto it=groups.find(key);if(it==groups.end())it=groups.emplace(key,Group{key.first,key.second,0,0}).first;it->second.total+=*r.amount;it->second.count++;}std::vector<Group>out;for(auto [key,g]:groups)if(g.total>=havingTotal)out.push_back(g);std::sort(out.begin(),out.end(),[](auto a,auto b){if(a.total!=b.total)return a.total>b.total;if(a.customerId!=b.customerId)return a.customerId<b.customerId;return a.name<b.name;});if(out.size()>limit)out.resize(limit);return out;}
