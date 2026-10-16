#include <bits/stdc++.h>
using namespace std;
struct Record { string address;bool healthy; };struct Answer { vector<string> addresses;string status;optional<int> expires;string source; };
struct Resolver {
  optional<Answer> cache;
  Answer resolve(int tick,const vector<Record>& records,int ttl,int negativeTTL){
    if(cache&&tick<*cache->expires){auto answer=*cache;answer.source="cache";return answer;}
    if(records.empty())cache=Answer{{},"NXDOMAIN",tick+negativeTTL,"authority"};
    else {vector<string> answers;for(auto r:records)if(r.healthy)answers.push_back(r.address);
      if(answers.empty())return {{},"no-healthy-answer",nullopt,"authority"};
      cache=Answer{answers,"answer",tick+ttl,"authority"};}
    return *cache;
  }
};
