import java.util.*;
class Breaker {record Event(int at,boolean success){}record Result(int at,boolean called,String state){}static List<Result> run(List<Event> events,int threshold,int cooldown){String state="closed";int failures=0,retryAt=0;List<Result>out=new ArrayList<>();
for(Event e:events){if(state.equals("open")&&e.at()>=retryAt)state="half-open";boolean called=!state.equals("open");
if(called){if(e.success()){state="closed";failures=0;}else if(++failures>=threshold||state.equals("half-open")){state="open";retryAt=e.at()+cooldown;}}
out.add(new Result(e.at(),called,state));}
return out;}}
