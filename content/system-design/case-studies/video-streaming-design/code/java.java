import java.util.*;
class Playback {record Result(double stall,int downloaded,List<Double>qualities){}
static Result simulate(double[] bandwidth,boolean adaptive){double buffer=2,estimate=1,stall=0,seconds=2;int segment=0;List<Double>qualities=new ArrayList<>();
for(double capacity:bandwidth){if(capacity==0){stall+=Math.max(0,seconds-buffer);buffer=Math.max(0,buffer-seconds);continue;}
double budget=estimate*(buffer<seconds?0.7:1),quality=4;if(adaptive){quality=0.5;for(double r:new double[]{0.5,1,2,4})if(r<=budget)quality=r;}
double duration=quality*seconds/capacity;stall+=Math.max(0,duration-buffer);buffer=Math.max(0,buffer-duration)+seconds;
estimate=0.7*estimate+0.3*capacity;qualities.add(quality);segment++;}return new Result(stall,segment,qualities);}}
