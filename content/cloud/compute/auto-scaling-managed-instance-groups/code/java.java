import java.util.*;
class Reference {
record Target(int desired,int lowTicks) {}
static Target desired(int[] load,int tick,int capacity,int targetPercent,int min,int max,int lag,int current,int lowTicks,int stabilization) {
  int signal=load[Math.max(0,tick-lag)];
  int target=Math.min(max,Math.max(min,(int)Math.ceil(signal/(capacity*targetPercent/100.0))));
  int nextLow=target<current?lowTicks+1:0;
  boolean allowed=target>current||nextLow>=stabilization;
  return new Target(allowed?target:current,nextLow);
}
}
