#include <bits/stdc++.h>
using namespace std;
struct Recovery { string serving;optional<vector<int>> recovered; };
Recovery failover(string strategy,int replicas,int available,int faultTick,int now,int detection,int promotion,int restoreDuration,const vector<int>& snapshot) {
  if(available>=replicas/2+1)return {"primary",nullopt};
  int wait=detection+(strategy=="cross-region"?promotion:restoreDuration);
  bool canRecover=strategy=="cross-region"||strategy=="backup-restore";
  if(!canRecover||now<faultTick+wait)return {"unavailable",nullopt};
  return {"fenced-secondary",snapshot};
}
