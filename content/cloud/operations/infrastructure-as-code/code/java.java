import java.util.*;
class Reference {
record Resource(String name,String region,int size) {} record Action(String name,String kind,Resource value) {}
static List<Action> plan(List<Resource> observed,List<Resource> desired) {
  Map<String,Resource> old=new HashMap<>(),next=new HashMap<>();for(Resource x:observed)old.put(x.name,x);for(Resource x:desired)next.put(x.name,x);
  List<Action> out=new ArrayList<>();for(Resource x:observed)if(!next.containsKey(x.name))out.add(new Action(x.name,"destroy",x));
  for(Resource x:desired){Resource before=old.get(x.name);String kind=before==null?"create":!before.region.equals(x.region)?"replace":before.size!=x.size?"update":null;if(kind!=null)out.add(new Action(x.name,kind,x));}
  return out;
}
static boolean blocked(List<Action> actions,boolean preventDestroy){return preventDestroy&&actions.stream().anyMatch(x->x.kind.equals("replace")||x.kind.equals("destroy"));}
}
