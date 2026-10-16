import java.util.*;
class Representation {record E(int to,int weight){}record Graph(List<List<E>> adj,Integer[][] matrix){}static Graph build(int n,int[][] edges,boolean directed){List<List<E>> adj=new ArrayList<>();for(int i=0;i<n;i++)adj.add(new ArrayList<>());Integer[][] matrix=new Integer[n][n];
for(int[] e:edges){int u=e[0],v=e[1],w=e[2];adj.get(u).add(new E(v,w));matrix[u][v]=w;
if(!directed){adj.get(v).add(new E(u,w));matrix[v][u]=w;}}
// null distinguishes an absent edge from weight zero.
return new Graph(adj,matrix);}}
