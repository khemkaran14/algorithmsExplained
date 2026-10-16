import java.util.*;
class Quorum {record Commit(int leader,int term,int votes){}record Round(List<Commit> commits,int nextTerm){}static Round round(int configured,List<List<Integer>> components,Map<Integer,Integer> leaders,Map<List<Integer>,Integer> missing,int tick,int timeout,int nextTerm){int quorum=configured/2+1;List<Commit>commits=new ArrayList<>();
for(List<Integer> group:components){List<Integer>known=new ArrayList<>();for(int node:group)if(leaders.containsKey(node))known.add(node);known.sort(Comparator.comparingInt((Integer n)->leaders.get(n)).reversed().thenComparingInt(n->n));for(int i=1;i<known.size();i++)leaders.remove(known.get(i));Integer leader=known.isEmpty()?null:known.get(0);
if(leader==null){missing.putIfAbsent(List.copyOf(group),tick);if(group.size()>=quorum&&tick-missing.get(group)>=timeout){leader=Collections.min(group);leaders.put(leader,++nextTerm);missing.remove(group);}}else missing.remove(group);
if(leader!=null&&group.size()>=quorum)commits.add(new Commit(leader,leaders.get(leader),group.size()));}
return new Round(commits,nextTerm);}}
