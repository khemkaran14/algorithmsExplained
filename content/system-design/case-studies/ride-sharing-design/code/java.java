import java.util.*;
class Dispatch {record Point(int id,int x,int y){}
static List<Integer> assign(List<Point>drivers,List<Point>riders){Map<Integer,Point>available=new HashMap<>();for(Point d:drivers)available.put(d.id(),d);List<Integer>out=new ArrayList<>();
for(Point rider:riders){Point best=null;int distance=Integer.MAX_VALUE;for(Point d:available.values()){int score=(d.x()-rider.x())*(d.x()-rider.x())+(d.y()-rider.y())*(d.y()-rider.y());if(score<distance||(score==distance&&(best==null||d.id()<best.id()))){best=d;distance=score;}}
if(best!=null)available.remove(best.id());out.add(best==null?-1:best.id());}return out;}}
// Independent full-scan baseline; shared reservations need atomic compare-and-set.
// ID -1 denotes no available driver.
