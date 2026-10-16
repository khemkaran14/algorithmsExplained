class Stairs {static long minimumCost(int[] cost){long[] dp=new long[cost.length+1];
for(int i=0;i<=cost.length;i++){
long one=i==0?0:dp[i-1],two=i<2?0:dp[i-2];
dp[i]=Math.min(one,two)+(i==cost.length?0:cost[i]);}
// The top is a virtual final state.
return dp[cost.length];}}
