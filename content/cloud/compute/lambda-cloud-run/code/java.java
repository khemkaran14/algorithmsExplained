import java.util.*;
class Reference {
record Environment(int id,String state,int jobs) {}record Admission(String action,Integer id) {}
static Admission admission(List<Environment> environments,String provider,int concurrency,int maximum,int waiting) {
  int slots=provider.equals("aws")?1:concurrency;
  List<Environment> live=environments.stream().filter(e->!e.state.equals("expired")).toList();
  for(Environment e:live)if(e.state.equals("warm")&&e.jobs<slots&&waiting==0)return new Admission("warm",e.id);
  long reserved=live.stream().filter(e->e.state.equals("starting")).count()*slots;
  return new Admission(live.size()<maximum&&waiting+1>reserved?"cold-start":"queue",null);
}
}
