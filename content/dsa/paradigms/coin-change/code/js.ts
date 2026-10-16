function coinChange(coins,amount,combinations=false){coins=[...new Set(coins)].sort((a,b)=>a-b);const dp=Array(amount+1).fill(combinations?0:Infinity);dp[0]=combinations?1:0;
if(combinations){for(const coin of coins)for(let a=coin;a<=amount;a++)dp[a]+=dp[a-coin];}
else for(let a=1;a<=amount;a++)for(const coin of coins){
if(coin<=a)dp[a]=Math.min(dp[a],dp[a-coin]+1);}
// Positive denominations; null denotes an unreachable minimum-count amount.
return Number.isFinite(dp[amount])?dp[amount]:null;}
