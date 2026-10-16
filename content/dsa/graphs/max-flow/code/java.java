import java.util.*;
class Flow {static class Arc{int to,rev;long cap;Arc(int to,int rev,long cap){this.to=to;this.rev=rev;this.cap=cap;}}static long maximum(int n,int[][] edges,int source,int sink,boolean dfs){if(source==sink)return 0;List<List<Arc>> adj=new ArrayList<>();for(int i=0;i<n;i++)adj.add(new ArrayList<>());for(int[] e:edges){int u=e[0],v=e[1];if(u==v)continue;int a=adj.get(u).size(),b=adj.get(v).size();adj.get(u).add(new Arc(v,b,e[2]));adj.get(v).add(new Arc(u,a,0));}long total=0;
while(true){int[] parent=new int[n],index=new int[n];Arrays.fill(parent,-1);ArrayDeque<Integer> q=new ArrayDeque<>();q.add(source);parent[source]=source;while(!q.isEmpty()&&parent[sink]==-1){int u=dfs?q.removeLast():q.removeFirst();for(int i=0;i<adj.get(u).size();i++){Arc e=adj.get(u).get(i);if(e.cap>0&&parent[e.to]==-1){parent[e.to]=u;index[e.to]=i;q.addLast(e.to);}}}if(parent[sink]==-1)break;
long amount=Long.MAX_VALUE;for(int v=sink;v!=source;v=parent[v])amount=Math.min(amount,adj.get(parent[v]).get(index[v]).cap);
for(int v=sink;v!=source;v=parent[v]){Arc e=adj.get(parent[v]).get(index[v]);e.cap-=amount;adj.get(v).get(e.rev).cap+=amount;}
total+=amount;}return total;}}
