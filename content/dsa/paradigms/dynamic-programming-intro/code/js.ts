function minimumCost(cost){const dp=[];
for(let i=0;i<=cost.length;i++){
const one=i===0?0:dp[i-1],two=i<2?0:dp[i-2];
dp[i]=Math.min(one,two)+(i===cost.length?0:cost[i]);}
// The virtual top costs zero; entering at stair zero or one is allowed.
return dp[cost.length];}
