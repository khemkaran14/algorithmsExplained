#include <vector>
#include <set>
#include <string>
#include <optional>
struct Customer{int id;std::string name;};struct Order{int id;std::optional<int>customerId;int amount;};struct Row{std::optional<int>customerId;std::optional<std::string>customerName;std::optional<int>orderId,amount;};
std::vector<Row> join(const std::vector<Customer>&customers,const std::vector<Order>&orders,const std::string& kind="left"){std::vector<Row>out;std::set<unsigned>matched;for(auto c:customers){bool found=false;for(unsigned i=0;i<orders.size();i++){auto o=orders[i];if(o.customerId&&*o.customerId==c.id){found=true;matched.insert(i);out.push_back({c.id,c.name,o.id,o.amount});}}if(!found&&(kind=="left"||kind=="full"))out.push_back({c.id,c.name,{},{}});}if(kind=="right"||kind=="full")for(unsigned i=0;i<orders.size();i++)if(!matched.count(i)){auto o=orders[i];out.push_back({{},{},o.id,o.amount});}return out;}
// SQL bag semantics; an empty optional never matches a key.
