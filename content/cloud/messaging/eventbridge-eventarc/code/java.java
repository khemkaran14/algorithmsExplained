import java.util.*;
class Reference {
record Event(String id,String source,String type) {}
record Rule(String target,String source,String type) {}
record Routed(int matched,int delivered,int suppressed,int unmatched,Map<String,Integer> effects,List<String> dead) {}
static Routed route(List<Event> events,List<Rule> rules,String failed,int maxAttempts,boolean dedup) {
  Set<List<String>> inbox=new HashSet<>();Map<String,Integer> effects=new TreeMap<>();List<String> dead=new ArrayList<>();int matched=0,delivered=0,suppressed=0,unmatched=0;
  for(Event e:events){Set<String> targets=new TreeSet<>();for(Rule r:rules)if((r.source.equals("*")||r.source.equals(e.source))&&(r.type.equals("*")||r.type.equals(e.type)))targets.add(r.target);
    if(targets.isEmpty())unmatched++;
    for(String target:targets){matched++;if(target.equals(failed)){dead.add(e.id+":"+target+":"+maxAttempts);continue;}
      delivered++;List<String> key=List.of(target,e.id);if(dedup&&inbox.contains(key))suppressed++;else{inbox.add(key);effects.merge(target,1,Integer::sum);}
    }
  }
  return new Routed(matched,delivered,suppressed,unmatched,effects,dead);
}
}
