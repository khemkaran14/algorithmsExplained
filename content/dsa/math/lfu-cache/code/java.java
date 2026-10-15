import java.util.*;
import java.util.function.IntUnaryOperator;
class LFU {int capacity,minimum=0;IntUnaryOperator loader;Map<Integer,Integer> values=new HashMap<>(),frequencies=new HashMap<>();Map<Integer,LinkedHashSet<Integer>> buckets=new HashMap<>();LFU(int capacity,IntUnaryOperator loader){this.capacity=capacity;this.loader=loader;}
void add(int f,int key){buckets.computeIfAbsent(f,x->new LinkedHashSet<>()).add(key);}
int get(int key){if(values.containsKey(key)){int f=frequencies.get(key);buckets.get(f).remove(key);if(buckets.get(f).isEmpty()){buckets.remove(f);if(minimum==f)minimum++;}frequencies.put(key,f+1);add(f+1,key);return values.get(key);}int value=loader.applyAsInt(key);if(values.size()==capacity){var b=buckets.get(minimum);int victim=b.iterator().next();b.remove(victim);if(b.isEmpty())buckets.remove(minimum);values.remove(victim);frequencies.remove(victim);}values.put(key,value);frequencies.put(key,1);add(1,key);minimum=1;
return value;}}
