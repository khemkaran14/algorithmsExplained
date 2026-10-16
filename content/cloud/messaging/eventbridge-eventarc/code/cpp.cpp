#include <bits/stdc++.h>
using namespace std;
struct Event { string id,source,type; }; struct Rule { string target,source,type; };
struct Routed { int matched=0,delivered=0,suppressed=0,unmatched=0; map<string,int> effects; vector<tuple<string,string,int>> dead; };
Routed route(const vector<Event>& events,const vector<Rule>& rules,string failed,int maxAttempts,bool dedup=true) {
  Routed out;set<pair<string,string>> inbox;
  for(const auto& e:events){set<string> targets;for(const auto& r:rules)if((r.source=="*"||r.source==e.source)&&(r.type=="*"||r.type==e.type))targets.insert(r.target);
    if(targets.empty())out.unmatched++;
    for(const auto& target:targets){out.matched++;if(target==failed){out.dead.emplace_back(e.id,target,maxAttempts);continue;}
      out.delivered++;auto key=make_pair(target,e.id);if(dedup&&inbox.count(key))out.suppressed++;else{inbox.insert(key);out.effects[target]++;}
    }
  }
  return out;
}
