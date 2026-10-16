import java.util.*;
class BFS {static int[] bfs(List<List<Integer>> adj,int start){int[] d=new int[adj.size()];Arrays.fill(d,-1);d[start]=0;ArrayDeque<Integer> q=new ArrayDeque<>();q.add(start);
while(!q.isEmpty()){int u=q.remove();
for(int v:adj.get(u))if(d[v]==-1){d[v]=d[u]+1;q.add(v);}}
// -1 marks an unreachable vertex.
return d;}}
