#include <bits/stdc++.h>
using namespace std;
struct Pod { string version,state; };
string nextAction(const vector<Pod>& pods,int desired,int surge,int unavailable,string target,bool freeHealthySlot) {
  vector<Pod> live;for(auto p:pods)if(p.state!="removed")live.push_back(p);
  int ready=0,count=0;for(auto p:live){ready+=p.state=="ready";count+=p.version==target;}
  if(count<desired&&(int)live.size()<desired+surge&&freeHealthySlot)return "create";
  bool removable=any_of(live.begin(),live.end(),[&](auto p){return p.version!=target&&(p.state!="ready"||ready-1>=desired-unavailable);});
  return removable?"remove-old":"wait";
}
