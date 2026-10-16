#include <bits/stdc++.h>
using namespace std;
uint64_t ip(string value){istringstream in(value);string part;uint64_t n=0;while(getline(in,part,'.'))n=n*256+stoul(part);return n;}
int prefix(string cidr){return stoi(cidr.substr(cidr.find('/')+1));}
bool contains(string cidr,string address){uint64_t size=1ULL<<(32-prefix(cidr));return ip(cidr.substr(0,cidr.find('/')))/size==ip(address)/size;}
struct Route { string cidr;int priority;string target; };
optional<Route> route(const vector<Route>& routes,string destination){optional<Route> best;for(auto r:routes)if(contains(r.cidr,destination)&&(!best||prefix(r.cidr)>prefix(best->cidr)||(prefix(r.cidr)==prefix(best->cidr)&&r.priority<best->priority)))best=r;return best;}
struct Rule { string direction,cidr;int from,to;string protocol;int priority;string action; };
bool statelessAllowed(const vector<Rule>& rules,string direction,string peer,int port,string protocol){optional<Rule> best;for(auto r:rules)if(r.direction==direction&&contains(r.cidr,peer)&&port>=r.from&&port<=r.to&&(r.protocol=="all"||r.protocol==protocol)&&(!best||r.priority<best->priority))best=r;return best&&best->action=="allow";}
