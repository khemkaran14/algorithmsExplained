import java.util.*;
class ChainedSet {final List<List<Integer>> b=new ArrayList<>();ChainedSet(int m){for(int i=0;i<m;i++)b.add(new ArrayList<>());}
boolean has(int k){return b.get(Math.floorMod(k,b.size())).contains(k);}
void add(int k){if(!has(k))b.get(Math.floorMod(k,b.size())).add(k);}
void delete(int k){b.get(Math.floorMod(k,b.size())).remove(Integer.valueOf(k));}
}
