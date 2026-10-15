import java.util.*;
class GrowingSet {static List<List<Integer>> build(int[] keys){int m=3,size=0;List<List<Integer>> b=new ArrayList<>();for(int i=0;i<m;i++)b.add(new ArrayList<>());
for(int key:keys){if(b.get(Math.floorMod(key,m)).contains(key))continue;
if((size+1.0)/m>.75){List<Integer> old=new ArrayList<>();for(List<Integer> chain:b)old.addAll(chain);m=2*m+1;b=new ArrayList<>();for(int i=0;i<m;i++)b.add(new ArrayList<>());
for(int v:old)b.get(Math.floorMod(v,m)).add(v);}
b.get(Math.floorMod(key,m)).add(key);size++;}return b;}}
