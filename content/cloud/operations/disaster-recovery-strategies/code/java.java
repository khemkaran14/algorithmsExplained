import java.util.*;
class Reference {
record Recovery(String serving,List<Integer> recovered) {}
static Recovery failover(String strategy,int replicas,int available,int faultTick,int now,int detection,int promotion,int restoreDuration,List<Integer> snapshot) {
  if(available>=replicas/2+1)return new Recovery("primary",null);
  int wait=detection+(strategy.equals("cross-region")?promotion:restoreDuration);
  boolean canRecover=strategy.equals("cross-region")||strategy.equals("backup-restore");
  if(!canRecover||now<faultTick+wait)return new Recovery("unavailable",null);
  return new Recovery("fenced-secondary",new ArrayList<>(snapshot));
}
}
