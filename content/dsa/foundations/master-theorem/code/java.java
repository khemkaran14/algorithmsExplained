import java.util.*;
class Recurrence {
static List<long[]> levels(int a,int b,int k,int n){var levels=new ArrayList<long[]>();long nodes=1;int level=0;
for(int size=n;size>=1;size/=b,nodes*=a,level++){long work=nodes*Math.round(Math.pow(size,k));levels.add(new long[]{level,nodes,size,work});if(size==1)break;}
// Compare k with Math.log(a)/Math.log(b) for the theorem case.
return levels;}}
