import java.util.*;
class Coins {static Long solve(int[] raw,int amount,boolean combinations){int[] coins=Arrays.stream(raw).distinct().sorted().toArray();long inf=Long.MAX_VALUE/4;long[] dp=new long[amount+1];Arrays.fill(dp,combinations?0:inf);dp[0]=combinations?1:0;
if(combinations){for(int coin:coins)for(int a=coin;a<=amount;a++)dp[a]+=dp[a-coin];}
else for(int a=1;a<=amount;a++)for(int coin:coins)if(coin<=a)dp[a]=Math.min(dp[a],dp[a-coin]+1);
// Bounded lesson amounts keep combination counts within long range.
return dp[amount]==inf?null:dp[amount];}}
