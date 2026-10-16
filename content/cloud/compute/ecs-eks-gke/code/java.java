import java.util.*;
class Reference {
record Pod(String version,String state) {}
static String nextAction(List<Pod> pods,int desired,int surge,int unavailable,String target,boolean freeHealthySlot) {
  List<Pod> live=pods.stream().filter(p->!p.state.equals("removed")).toList();
  long ready=live.stream().filter(p->p.state.equals("ready")).count(),count=live.stream().filter(p->p.version.equals(target)).count();
  if(count<desired&&live.size()<desired+surge&&freeHealthySlot)return "create";
  boolean removable=live.stream().anyMatch(p->!p.version.equals(target)&&(!p.state.equals("ready")||ready-1>=desired-unavailable));
  return removable?"remove-old":"wait";
}
}
