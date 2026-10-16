import java.util.*;
class DFS {static void visit(List<List<Integer>> adj,int u,boolean[] seen,List<Integer> out){seen[u]=true;out.add(u);
for(int v:adj.get(u))if(!seen[v])visit(adj,v,seen,out);}
static List<Integer> dfs(List<List<Integer>> adj,int start){List<Integer> out=new ArrayList<>();
visit(adj,start,new boolean[adj.size()],out);
return out;}}
