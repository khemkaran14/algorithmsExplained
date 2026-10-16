import java.util.*;
class Reference {
record Costs(double origin,double compute,double storage,double egress,double cache,double total) {}
static Costs estimate(double requests,double hit,int replicas,double hours,double hourly,double perMillion,double storageGB,double storageRate,double responseKB,double publicPercent,double egressRate,double cacheRate,boolean instances) {
  double origin=requests*(1-hit/100);
  double compute=instances?replicas*hours*hourly:origin/1e6*perMillion;
  double storage=storageGB*storageRate*hours/730;
  double egress=requests*responseKB/1e6*publicPercent/100*egressRate;
  double cache=hit>0?cacheRate*hours/730:0;
  return new Costs(origin,compute,storage,egress,cache,compute+storage+egress+cache);
}
}
