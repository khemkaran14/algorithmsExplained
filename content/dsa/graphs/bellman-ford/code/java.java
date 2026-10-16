import java.util.*;
class BellmanFord {static double[] shortest(int n,int[][] edges,int start){double[] d=new double[n];Arrays.fill(d,Double.POSITIVE_INFINITY);d[start]=0;
for(int pass=1;pass<n;pass++){boolean changed=false;for(int[] e:edges)if(d[e[0]]+e[2]<d[e[1]]){d[e[1]]=d[e[0]]+e[2];changed=true;}if(!changed)break;}
boolean[] bad=new boolean[n];ArrayDeque<Integer> q=new ArrayDeque<>();List<List<Integer>> adj=new ArrayList<>();for(int i=0;i<n;i++)adj.add(new ArrayList<>());for(int[] e:edges){adj.get(e[0]).add(e[1]);if(d[e[0]]+e[2]<d[e[1]]&&!bad[e[1]]){bad[e[1]]=true;q.add(e[1]);}}
while(!q.isEmpty())for(int v:adj.get(q.remove()))if(!bad[v]){bad[v]=true;q.add(v);}for(int v=0;v<n;v++)if(bad[v])d[v]=Double.NEGATIVE_INFINITY;
return d;}}
