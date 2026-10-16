function knapsack(weights,values,capacity){const dp=Array.from({length:weights.length+1},()=>Array(capacity+1).fill(0));
for(let i=1;i<=weights.length;i++)for(let w=0;w<=capacity;w++){
const skip=dp[i-1][w],take=weights[i-1]<=w?values[i-1]+dp[i-1][w-weights[i-1]]:-1;
dp[i][w]=Math.max(skip,take);}
const items=[];for(let i=weights.length,w=capacity;i>0;i--)if(dp[i][w]!==dp[i-1][w]){items.push(i-1);w-=weights[i-1];}
return {value:dp[weights.length][capacity],items:items.reverse()};}
