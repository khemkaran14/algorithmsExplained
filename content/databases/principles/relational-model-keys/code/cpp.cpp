#include <vector>
#include <set>
#include <string>
#include <optional>
struct Customer{int id;std::string name;};struct Order{int id;std::optional<int>customerId;int amount;};
std::vector<std::string> constraints(const std::vector<Customer>&customers,const std::vector<Order>&orders){std::set<int>ids,orderIds;std::vector<std::string>errors;for(auto c:customers)if(!ids.insert(c.id).second)errors.push_back("duplicate customer");for(auto o:orders){if(!orderIds.insert(o.id).second)errors.push_back("duplicate order");if(o.customerId&&!ids.count(*o.customerId))errors.push_back("orphan customer");}return errors;}
// std::optional models SQL NULL; the foreign-key check skips only absent values.
