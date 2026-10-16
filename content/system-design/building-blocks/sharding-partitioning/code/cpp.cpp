#include <vector>
#include <string>
#include <cstdint>
#include <algorithm>
#include <tuple>
uint32_t hash32(const std::string& s){uint32_t x=2166136261u;for(unsigned char ch:s)x=(x^ch)*16777619u;x=(x^(x>>16))*0x85ebca6bu;x=(x^(x>>13))*0xc2b2ae35u;return x^(x>>16);}
std::vector<int> owners(const std::vector<int>& nodes,const std::vector<int>& keys,const std::string& strategy="consistent",int replicas=4){struct Token{uint32_t hash;int node;};std::vector<Token>ring;for(int node:nodes)for(int r=0;r<replicas;r++)ring.push_back({hash32("node:"+std::to_string(node)+":"+std::to_string(r)),node});std::sort(ring.begin(),ring.end(),[](auto a,auto b){return std::tie(a.hash,a.node)<std::tie(b.hash,b.node);});std::vector<int>out;for(int key:keys){if(strategy=="modulo"){out.push_back(nodes[key%nodes.size()]);continue;}if(strategy=="range"){out.push_back(nodes[std::min(int(nodes.size())-1,key*int(nodes.size())/1000)]);continue;}uint32_t hash=hash32("key:"+std::to_string(key));auto it=std::lower_bound(ring.begin(),ring.end(),hash,[](auto token,uint32_t value){return token.hash<value;});out.push_back((it==ring.end()?ring.front():*it).node);}return out;}
