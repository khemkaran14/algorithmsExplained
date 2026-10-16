import java.util.*;
import java.util.function.IntToDoubleFunction;
class Shortest {record Arc(int to,int weight){}record Item(int vertex,double priority,double distance){}static double[] shortest(List<List<Arc>> adj,int start,Integer target,IntToDoubleFunction heuristic){double[] d=new double[adj.size()];Arrays.fill(d,Double.POSITIVE_INFINITY);d[start]=0;PriorityQueue<Item> q=new PriorityQueue<>(Comparator.comparingDouble(Item::priority));q.add(new Item(start,heuristic.applyAsDouble(start),0));
while(!q.isEmpty()){Item item=q.remove();int u=item.vertex();if(item.distance()!=d[u])continue;if(target!=null&&u==target)break;for(Arc e:adj.get(u)){if(e.weight()<0)throw new IllegalArgumentException();double next=d[u]+e.weight();if(next<d[e.to()]){d[e.to()]=next;q.add(new Item(e.to(),next+heuristic.applyAsDouble(e.to()),next));}}}
// Supply zero heuristic for Dijkstra, or a consistent lower bound for target-directed A*.
return d;}}
