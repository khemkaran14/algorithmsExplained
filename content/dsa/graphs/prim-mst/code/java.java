import java.util.*;
class Prim {record Edge(int to,int weight){}record Item(int from,int vertex,int weight){}record Forest(List<Item> edges,long total,int components){}static Forest build(List<List<Edge>> adj){boolean[] seen=new boolean[adj.size()];PriorityQueue<Item> q=new PriorityQueue<>(Comparator.comparingInt(Item::weight));List<Item> chosen=new ArrayList<>();long total=0;int components=0;
for(int seed=0;seed<seen.length;seed++){if(seen[seed])continue;components++;q.add(new Item(-1,seed,0));
while(!q.isEmpty()){Item e=q.remove();int u=e.vertex();if(seen[u])continue;seen[u]=true;if(e.from()!=-1){chosen.add(e);total+=e.weight();}for(Edge v:adj.get(u))if(!seen[v.to()])q.add(new Item(u,v.to(),v.weight()));}}
// Every undirected component is independently seeded.
return new Forest(chosen,total,components);}}
