import java.util.*;
class BFS { static List<Integer> walk(List<List<Integer>> adj) {var seen=new HashSet<Integer>();var queue=new ArrayDeque<Integer>();var order=new ArrayList<Integer>();seen.add(0);queue.add(0);while(!queue.isEmpty()){
  int node=queue.remove();order.add(node);
  for(int next:adj.get(node))if(!seen.contains(next)){
    seen.add(next);queue.add(next);}}
  return order;} }
