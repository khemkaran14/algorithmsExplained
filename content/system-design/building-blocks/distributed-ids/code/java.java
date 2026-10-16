import java.util.*;
class IDs {record Event(int worker,long time){}static List<String> generate(int[] workers,List<Event> events,boolean logicalWait){long[] last=new long[workers.length];Arrays.fill(last,-1);int[] seq=new int[workers.length];List<String>out=new ArrayList<>();
for(Event e:events){int i=e.worker();long time=e.time();if(time<last[i]){if(!logicalWait){out.add(null);continue;}time=last[i];}
int next=time==last[i]?seq[i]+1:0;if(next>=16){if(!logicalWait){out.add(null);continue;}time=last[i]+1;next=0;}
last[i]=time;seq[i]=next;out.add(Long.toString((time<<7)|((long)workers[i]<<4)|next));}
return out;}}
