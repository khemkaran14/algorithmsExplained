import java.util.*;
class Suggest {record Term(String word,int frequency){}static class Node{Map<Character,Node>children=new HashMap<>();Term term;}
static void collect(Node n,List<Term>out){if(n.term!=null)out.add(n.term);for(Node child:n.children.values())collect(child,out);}
static List<Term> suggest(List<Term>dictionary,String prefix,int k){Node root=new Node();for(Term t:dictionary){Node n=root;for(char ch:t.word().toCharArray())n=n.children.computeIfAbsent(ch,c->new Node());n.term=t;}
Node n=root;for(char ch:prefix.toCharArray()){n=n.children.get(ch);if(n==null)return List.of();}List<Term>out=new ArrayList<>();collect(n,out);
out.sort(Comparator.comparingInt(Term::frequency).reversed().thenComparing(Term::word));return out.subList(0,Math.min(k,out.size()));}}
// Prefix subtree enumeration and explicit ranking; no full-text search semantics.
