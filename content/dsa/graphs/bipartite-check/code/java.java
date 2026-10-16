import java.util.*;
class Bipartite {static boolean check(List<List<Integer>> adj){int[] c=new int[adj.size()];Arrays.fill(c,-1);
for(int seed=0;seed<c.length;seed++){if(c[seed]>=0)continue;ArrayDeque<Integer> q=new ArrayDeque<>();q.add(seed);c[seed]=0;
while(!q.isEmpty()){int u=q.remove();for(int v:adj.get(u)){if(c[v]==-1){c[v]=1-c[u];q.add(v);}else if(c[v]==c[u])return false;}}}
// A self-loop fails the same-color test.
return true;}}
