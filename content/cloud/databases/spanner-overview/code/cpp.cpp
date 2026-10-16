#include <bits/stdc++.h>
using namespace std;
struct Commit { bool acknowledged; long long clock,timestamp,delay; bool timingCondition; };
Commit commit(long long clock,long long previous,long long epsilon,int reachable,int replicas,bool wait=true) {
  if(reachable<replicas/2+1) return {false,clock,previous,0,false};
  long long timestamp=max(previous+1,clock+epsilon);
  long long delay=wait?max(0LL,timestamp+epsilon+1-clock):0;
  clock+=delay;
  return {true,clock,timestamp,delay,clock-epsilon>timestamp};
}
