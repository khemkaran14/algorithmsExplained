import java.util.*;
class LowLinks {record Arc(int to,int edge){}final List<List<Arc>> adj;final int[] discovery,low;final List<int[]> bridges=new ArrayList<>();final Set<Integer> cuts=new HashSet<>();int time;LowLinks(List<List<Arc>> adj){this.adj=adj;discovery=new int[adj.size()];low=new int[adj.size()];Arrays.fill(discovery,-1);for(int u=0;u<adj.size();u++)if(discovery[u]==-1)visit(u,-1);}
void visit(int u,int incoming){discovery[u]=low[u]=time++;int children=0;
for(Arc e:adj.get(u)){int v=e.to();if(e.edge()==incoming)continue;if(discovery[v]==-1){children++;visit(v,e.edge());low[u]=Math.min(low[u],low[v]);if(low[v]>discovery[u])bridges.add(new int[]{u,v});if(incoming!=-1&&low[v]>=discovery[u])cuts.add(u);}else low[u]=Math.min(low[u],discovery[v]);}
if(incoming==-1&&children>1)cuts.add(u);}
}
