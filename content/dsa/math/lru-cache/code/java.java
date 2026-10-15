import java.util.*;
import java.util.function.IntUnaryOperator;
class LRU {private final int capacity;private final IntUnaryOperator loader;private final LinkedHashMap<Integer,Integer> cache=new LinkedHashMap<>(16,.75f,true);
LRU(int capacity,IntUnaryOperator loader){this.capacity=capacity;this.loader=loader;}
int get(int key){if(cache.containsKey(key))return cache.get(key);int value=loader.applyAsInt(key);if(cache.size()==capacity)cache.remove(cache.keySet().iterator().next());cache.put(key,value);
return value;}}
