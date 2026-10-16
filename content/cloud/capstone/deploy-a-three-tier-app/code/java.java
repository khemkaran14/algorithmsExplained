import java.util.*;
class Reference {
static String requestPath(boolean ingress,boolean lbToApp,boolean cacheHit,boolean appToDb,boolean dbIdentity) {
  if(!ingress||!lbToApp)return "rejected-ingress";
  if(cacheHit)return "completed-public-catalog-cache";
  if(!appToDb||!dbIdentity)return "failed-db-path-or-identity";
  return "queued-for-shared-db-capacity";
}
static boolean conserved(int offered,int completed,int failed,int rejected,int pending){return offered==completed+failed+rejected+pending;}
}
