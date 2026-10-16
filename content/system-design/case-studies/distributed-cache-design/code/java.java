import java.util.*;
import java.util.function.*;
class ReplicaCache {record Row(int value,int version,int expires){}List<LinkedHashMap<Integer,Row>>stores=new ArrayList<>();Map<Integer,Row>origin=new HashMap<>();int capacity,ttl;IntFunction<int[]>owners;
ReplicaCache(int nodes,int capacity,int ttl,IntFunction<int[]>owners){this.capacity=capacity;this.ttl=ttl;this.owners=owners;for(int i=0;i<nodes;i++)stores.add(new LinkedHashMap<>(16,0.75f,true));}
void fill(int node,int key,Row row,int tick){var s=stores.get(node);s.put(key,new Row(row.value(),row.version(),tick+ttl));if(s.size()>capacity)s.remove(s.keySet().iterator().next());}
boolean put(int key,int value,int tick,IntPredicate healthy,boolean originDown){if(originDown)return false;Row row=new Row(value,origin.getOrDefault(key,new Row(0,0,0)).version()+1,0);origin.put(key,row);for(int n:owners.apply(key))if(healthy.test(n))fill(n,key,row,tick);return true;}
Row get(int key,int tick,IntPredicate healthy,boolean originDown){for(int n:owners.apply(key)){if(!healthy.test(n))continue;var s=stores.get(n);Row row=s.get(key);if(row!=null&&row.expires()>tick)return row;s.remove(key);}if(originDown)return null;Row row=origin.getOrDefault(key,new Row(key*10,0,0));for(int n:owners.apply(key))if(healthy.test(n))fill(n,key,row,tick);return row;}}
// Inject fixed-ring distinct owners. LRU order follows successful accesses; TTL never extends on hit.
