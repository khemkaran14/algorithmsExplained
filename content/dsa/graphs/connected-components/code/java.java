import java.util.*;
class Components {static int[] labels(List<List<Integer>> adj){int[] label=new int[adj.size()];Arrays.fill(label,-1);int count=0;
for(int seed=0;seed<adj.size();seed++){if(label[seed]>=0)continue;ArrayDeque<Integer> q=new ArrayDeque<>();q.add(seed);label[seed]=count;
while(!q.isEmpty())for(int v:adj.get(q.remove()))if(label[v]==-1){label[v]=count;q.add(v);}
count++;}
return label;}}
