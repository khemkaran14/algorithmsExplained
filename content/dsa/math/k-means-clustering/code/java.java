import java.util.*;
class KMeans {static int[] fit(double[][] points,double[][] centers,int iterations){int[] groups=new int[points.length];Arrays.fill(groups,-1);
for(int step=0;step<iterations;step++){boolean changed=false;for(int i=0;i<points.length;i++){int best=0;double distance=Double.POSITIVE_INFINITY;for(int c=0;c<centers.length;c++){double d=Math.pow(points[i][0]-centers[c][0],2)+Math.pow(points[i][1]-centers[c][1],2);if(d<distance){distance=d;best=c;}}changed|=groups[i]!=best;groups[i]=best;}
for(int c=0;c<centers.length;c++){double x=0,y=0;int count=0;for(int i=0;i<points.length;i++)if(groups[i]==c){x+=points[i][0];y+=points[i][1];count++;}if(count>0){centers[c][0]=x/count;centers[c][1]=y/count;}}
if(!changed)break;}
return groups;}}
