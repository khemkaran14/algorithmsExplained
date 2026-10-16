import java.util.*;
class Reference {
record Commit(boolean acknowledged, long clock, long timestamp, long delay, boolean timingCondition) {}
static Commit commit(long clock,long previous,long epsilon,int reachable,int replicas,boolean wait) {
  if(reachable<replicas/2+1) return new Commit(false,clock,previous,0,false);
  long timestamp=Math.max(previous+1,clock+epsilon);
  long delay=wait?Math.max(0,timestamp+epsilon+1-clock):0;
  clock+=delay;
  return new Commit(true,clock,timestamp,delay,clock-epsilon>timestamp);
}
}
