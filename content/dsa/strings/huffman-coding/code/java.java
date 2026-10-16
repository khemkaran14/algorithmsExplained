import java.util.*;
class Huffman {static class N{int freq,id;Character ch;N left,right;N(int f,int id,Character ch,N l,N r){freq=f;this.id=id;this.ch=ch;left=l;right=r;}}static void visit(N n,String prefix,Map<Character,String> codes){if(n.ch!=null)codes.put(n.ch,prefix.isEmpty()?"0":prefix);else{visit(n.left,prefix+"0",codes);visit(n.right,prefix+"1",codes);}}
static Map<Character,String> codes(String text){TreeMap<Character,Integer> freq=new TreeMap<>();for(char ch:text.toCharArray())freq.merge(ch,1,Integer::sum);PriorityQueue<N> q=new PriorityQueue<>(Comparator.comparingInt((N n)->n.freq).thenComparingInt(n->n.id));int id=0;
for(var e:freq.entrySet())q.add(new N(e.getValue(),id++,e.getKey(),null,null));
while(q.size()>1){N a=q.remove(),b=q.remove();q.add(new N(a.freq+b.freq,id++,null,a,b));}
Map<Character,String> out=new TreeMap<>();visit(q.remove(),"",out);return out;}}
