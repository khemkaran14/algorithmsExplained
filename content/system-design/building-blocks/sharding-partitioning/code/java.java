import java.util.*;
class Sharding {record Token(long hash,int node){}static long hash(String s){int x=0x811c9dc5;for(char ch:s.toCharArray())x=(x^ch)*16777619;x=(x^(x>>>16))*0x85ebca6b;x=(x^(x>>>13))*0xc2b2ae35;return Integer.toUnsignedLong(x^(x>>>16));}
static List<Integer> owners(int[] nodes,int[] keys,String strategy,int replicas){List<Token> ring=new ArrayList<>();for(int node:nodes)for(int r=0;r<replicas;r++)ring.add(new Token(hash("node:"+node+":"+r),node));ring.sort(Comparator.comparingLong(Token::hash).thenComparingInt(Token::node));List<Integer> out=new ArrayList<>();
for(int key:keys){if(strategy.equals("modulo")){out.add(nodes[key%nodes.length]);continue;}if(strategy.equals("range")){out.add(nodes[Math.min(nodes.length-1,key*nodes.length/1000)]);continue;}long h=hash("key:"+key);int lo=0,hi=ring.size();while(lo<hi){int mid=lo+(hi-lo)/2;if(ring.get(mid).hash()>=h)hi=mid;else lo=mid+1;}out.add(ring.get(lo%ring.size()).node());}
// Recompute after adding a node; migration depends on changed physical owners.
return out;}}
