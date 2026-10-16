#include <bits/stdc++.h>
using namespace std;
struct Target { int desired,lowTicks; };
Target desired(const vector<int>& load,int tick,int capacity,int targetPercent,int minimum,int maximum,int lag,int current,int lowTicks,int stabilization) {
  int signal=load[max(0,tick-lag)];
  int target=min(maximum,max(minimum,(int)ceil(signal/(capacity*targetPercent/100.0))));
  int nextLow=target<current?lowTicks+1:0;
  bool allowed=target>current||nextLow>=stabilization;
  return {allowed?target:current,nextLow};
}
