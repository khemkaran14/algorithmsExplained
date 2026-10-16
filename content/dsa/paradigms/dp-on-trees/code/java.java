import java.util.*;
class TreeDP {static long maximum(int[] parents,int[] weights){long[][] dp=new long[parents.length][2];List<List<Integer>> children=new ArrayList<>();for(int i=0;i<parents.length;i++)children.add(new ArrayList<>());for(int i=1;i<parents.length;i++)children.get(parents[i]).add(i);
for(int u=parents.length-1;u>=0;u--){dp[u][1]=weights[u];
for(int v:children.get(u)){dp[u][1]+=dp[v][0];dp[u][0]+=Math.max(dp[v][0],dp[v][1]);}}
// Parent indices precede children, so reverse index order is a valid postorder.
return Math.max(dp[0][0],dp[0][1]);}}
