#include <vector>
#include <map>
#include <set>
#include <string>
#include <optional>
#include <algorithm>
#include <cstdint>
uint32_t hash32(const std::string&text){uint32_t h=2166136261u;for(unsigned char ch:text)h=(h^ch)*16777619u;h=(h^(h>>16))*0x85ebca6bu;h=(h^(h>>13))*0xc2b2ae35u;return h^(h>>16);}
struct Entry{int key;std::optional<int>value;int sequence;};struct Run{std::vector<Entry>entries;std::set<unsigned>bits;};
struct LSM{int limit,sequence=0;std::map<int,Entry>mem;std::vector<Run>runs;explicit LSM(int n=3):limit(n){}std::vector<unsigned>bits(int key){return {hash32("a:"+std::to_string(key))%64,hash32("b:"+std::to_string(key))%64};}Run make(std::vector<Entry>entries){std::sort(entries.begin(),entries.end(),[](auto a,auto b){return a.key<b.key;});std::set<unsigned>filter;for(auto e:entries)for(auto bit:bits(e.key))filter.insert(bit);return {entries,filter};}void put(int key,std::optional<int>value){mem.insert_or_assign(key,Entry{key,value,++sequence});if(int(mem.size())>=limit)flush();}void erase(int key){put(key,{});}void flush(){if(mem.empty())return;std::vector<Entry>entries;for(auto [key,e]:mem)entries.push_back(e);runs.insert(runs.begin(),make(entries));mem.clear();}
void compact(bool full=false){if(runs.size()<2)return;unsigned start=full?0:runs.size()-2;std::map<int,Entry>merged;for(unsigned i=start;i<runs.size();i++)for(auto e:runs[i].entries){auto it=merged.find(e.key);if(it==merged.end()||it->second.sequence<e.sequence)merged.insert_or_assign(e.key,e);}runs.erase(runs.begin()+start,runs.end());std::vector<Entry>entries;for(auto [key,e]:merged)if(!full||e.value)entries.push_back(e);if(!entries.empty())runs.insert(runs.begin()+start,make(entries));}
std::optional<int> get(int key,bool bloom=true){auto it=mem.find(key);if(it!=mem.end())return it->second.value;for(const auto&r:runs){auto b=bits(key);if(bloom&&(!r.bits.count(b[0])||!r.bits.count(b[1])))continue;auto e=std::lower_bound(r.entries.begin(),r.entries.end(),key,[](auto row,int value){return row.key<value;});if(e!=r.entries.end()&&e->key==key)return e->value;}return {};}};
// Partial compaction keeps tombstones; complete run coverage can purge them. No physical I/O/WAL.
