import java.util.*;
class PageRank {static double[] rank(List<List<Integer>> adj,double d,int iterations){int n=adj.size();double[] rank=new double[n];Arrays.fill(rank,1.0/n);
for(int step=0;step<iterations;step++){double[] next=new double[n];double dangling=0;for(int u=0;u<n;u++)if(adj.get(u).isEmpty())dangling+=rank[u];Arrays.fill(next,(1-d)/n+d*dangling/n);
for(int u=0;u<n;u++)for(int v:adj.get(u))next[v]+=d*rank[u]/adj.get(u).size();
rank=next;}
return rank;}}
