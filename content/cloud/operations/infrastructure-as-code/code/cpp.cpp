#include <bits/stdc++.h>
using namespace std;
struct Resource { string name,region; int size; };struct Action { string name,kind;Resource value; };
vector<Action> plan(const vector<Resource>& observed,const vector<Resource>& desired) {
  map<string,Resource> old,next;for(auto x:observed)old[x.name]=x;for(auto x:desired)next[x.name]=x;
  vector<Action> out;for(auto x:observed)if(!next.count(x.name))out.push_back({x.name,"destroy",x});
  for(auto x:desired){string kind=!old.count(x.name)?"create":old[x.name].region!=x.region?"replace":old[x.name].size!=x.size?"update":"";if(!kind.empty())out.push_back({x.name,kind,x});}
  return out;
}
bool blocked(const vector<Action>& actions,bool preventDestroy){return preventDestroy&&any_of(actions.begin(),actions.end(),[](auto x){return x.kind=="replace"||x.kind=="destroy";});}
