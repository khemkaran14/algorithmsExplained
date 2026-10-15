import java.util.*;
class Diameter {static int[] far(List<List<Integer>> adj,int start){int[] d=new int[adj.size()];Arrays.fill(d,-1);d[start]=0;ArrayDeque<Integer> q=new ArrayDeque<>();q.add(start);int best=start;
while(!q.isEmpty()){int u=q.remove();if(d[u]>d[best])best=u;for(int v:adj.get(u))if(d[v]==-1){d[v]=d[u]+1;q.add(v);}}
return new int[]{best,d[best]};}
static int diameter(List<List<Integer>> adj){int end=far(adj,0)[0];
return far(adj,end)[1];}}
