import java.util.*;
class Cycle {record Arc(int to,int edge){}static boolean visit(List<List<Arc>> adj,int u,int incoming,boolean directed,int[] color){color[u]=1;
for(Arc e:adj.get(u)){if(!directed&&e.edge()==incoming)continue;int v=e.to();if(color[v]==0){if(visit(adj,v,e.edge(),directed,color))return true;}else if(!directed||color[v]==1)return true;}
color[u]=2;return false;}
static boolean cycle(List<List<Arc>> adj,boolean directed){int[] c=new int[adj.size()];for(int u=0;u<c.length;u++)if(c[u]==0&&visit(adj,u,-1,directed,c))return true;
return false;}}
