import java.util.*;
class Topological {static boolean visit(List<List<Integer>> adj,int u,int[] c,List<Integer> out){c[u]=1;for(int v:adj.get(u))if(c[v]==1||(c[v]==0&&!visit(adj,v,c,out)))return false;c[u]=2;out.add(u);return true;}
static List<Integer> order(List<List<Integer>> adj,boolean dfs){List<Integer> out=new ArrayList<>();int n=adj.size();if(dfs){int[] c=new int[n];for(int u=0;u<n;u++)if(c[u]==0&&!visit(adj,u,c,out))return null;Collections.reverse(out);return out;}
int[] degree=new int[n];for(var row:adj)for(int v:row)degree[v]++;ArrayDeque<Integer> q=new ArrayDeque<>();for(int u=0;u<n;u++)if(degree[u]==0)q.add(u);
while(!q.isEmpty()){int u=q.remove();out.add(u);for(int v:adj.get(u))if(--degree[v]==0)q.add(v);}
return out.size()==n?out:null;}}
