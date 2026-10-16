import java.util.*;
class LIS {static List<Integer> indices(int[] a){int[] tails=new int[a.length],at=new int[a.length],prev=new int[a.length];int length=0;
for(int i=0;i<a.length;i++){int lo=0,hi=length;while(lo<hi){int mid=lo+(hi-lo)/2;if(tails[mid]<a[i])lo=mid+1;else hi=mid;}prev[i]=lo>0?at[lo-1]:-1;tails[lo]=a[i];at[lo]=i;if(lo==length)length++;}
List<Integer> out=new ArrayList<>();for(int i=at[length-1];i!=-1;i=prev[i])out.add(i);
Collections.reverse(out);
return out;}}
