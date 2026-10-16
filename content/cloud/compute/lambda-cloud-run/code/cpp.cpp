#include <bits/stdc++.h>
using namespace std;
struct Environment { int id;string state;int jobs; };struct Admission { string action;optional<int> id; };
Admission admission(const vector<Environment>& environments,string provider,int concurrency,int maximum,int waiting) {
  int slots=provider=="aws"?1:concurrency;
  vector<Environment> live;for(auto e:environments)if(e.state!="expired")live.push_back(e);
  for(auto e:live)if(e.state=="warm"&&e.jobs<slots&&waiting==0)return {"warm",e.id};
  int reserved=0;for(auto e:live)if(e.state=="starting")reserved+=slots;
  return {(int)live.size()<maximum&&waiting+1>reserved?"cold-start":"queue",nullopt};
}
