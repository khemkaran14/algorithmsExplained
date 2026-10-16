#include <vector>
#include <map>
#include <list>
#include <optional>
#include <functional>
struct Row{int value,version,expires;};
struct ReplicaCache{int capacity,ttl;struct Store{std::map<int,Row>rows;std::list<int>lru;};std::vector<Store>stores;std::map<int,Row>origin;std::function<std::vector<int>(int)>owners;
ReplicaCache(int nodes,int c,int t,std::function<std::vector<int>(int)>o):capacity(c),ttl(t),stores(nodes),owners(o){}
void fill(int node,int key,Row row,int tick){auto& s=stores[node];s.lru.remove(key);s.lru.push_back(key);row.expires=tick+ttl;s.rows[key]=row;if(int(s.rows.size())>capacity){s.rows.erase(s.lru.front());s.lru.pop_front();}}
bool put(int key,int value,int tick,std::function<bool(int)>healthy,bool originDown=false){if(originDown)return false;int version=origin.count(key)?origin.at(key).version:0;Row row{value,version+1,0};origin[key]=row;for(int n:owners(key))if(healthy(n))fill(n,key,row,tick);return true;}
std::optional<Row> get(int key,int tick,std::function<bool(int)>healthy,bool originDown=false){for(int n:owners(key)){if(!healthy(n))continue;auto& s=stores[n];auto it=s.rows.find(key);if(it!=s.rows.end()&&it->second.expires>tick){s.lru.remove(key);s.lru.push_back(key);return it->second;}s.rows.erase(key);s.lru.remove(key);}if(originDown)return {};Row row=origin.count(key)?origin.at(key):Row{key*10,0,0};for(int n:owners(key))if(healthy(n))fill(n,key,row,tick);return row;}};
// Inject a fixed-ring owner function; list.remove is linear in this simple reference implementation.
