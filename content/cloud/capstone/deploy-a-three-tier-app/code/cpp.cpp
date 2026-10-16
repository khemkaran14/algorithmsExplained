#include <bits/stdc++.h>
using namespace std;
string requestPath(bool ingress,bool lbToApp,bool cacheHit,bool appToDb,bool dbIdentity) {
  if(!ingress||!lbToApp)return "rejected-ingress";
  if(cacheHit)return "completed-public-catalog-cache";
  if(!appToDb||!dbIdentity)return "failed-db-path-or-identity";
  return "queued-for-shared-db-capacity";
}
bool conserved(int offered,int completed,int failed,int rejected,int pending){return offered==completed+failed+rejected+pending;}
