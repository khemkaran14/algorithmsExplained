import java.util.*;
class Trie {static class N{boolean end;Map<Character,N> next=new HashMap<>();}final N root=new N();
void add(String word){N n=root;for(char ch:word.toCharArray())n=n.next.computeIfAbsent(ch,k->new N());n.end=true;}
boolean has(String query,boolean prefix){N n=root;
for(char ch:query.toCharArray()){n=n.next.get(ch);if(n==null)return false;}
return prefix||n.end;}}
