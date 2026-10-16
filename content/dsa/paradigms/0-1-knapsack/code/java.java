import java.util.*;
class Knapsack {record Answer(int value,List<Integer> items){}static Answer solve(int[] weights,int[] values,int capacity){int[][] dp=new int[weights.length+1][capacity+1];
for(int i=1;i<=weights.length;i++)for(int w=0;w<=capacity;w++)dp[i][w]=Math.max(dp[i-1][w],weights[i-1]<=w?values[i-1]+dp[i-1][w-weights[i-1]]:-1);
List<Integer> items=new ArrayList<>();for(int i=weights.length,w=capacity;i>0;i--)if(dp[i][w]!=dp[i-1][w]){items.add(i-1);w-=weights[i-1];}
Collections.reverse(items);
return new Answer(dp[weights.length][capacity],items);}}
