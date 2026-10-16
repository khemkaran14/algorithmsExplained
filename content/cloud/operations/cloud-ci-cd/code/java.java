import java.util.*;
class Reference {
static String decision(boolean tests,boolean policy,boolean signature,int candidate,int errors,int baseline,int baselineErrors,int minSamples,double maxError,double maxRegression) {
  if(!tests||!policy||!signature)return "reject-before-rollout";
  if(candidate<minSamples||baseline==0)return "hold";
  double rate=100.0*errors/candidate,stableRate=100.0*baselineErrors/baseline;
  if(rate>maxError||rate-stableRate>maxRegression)return "rollback";
  return "advance";
}
}
