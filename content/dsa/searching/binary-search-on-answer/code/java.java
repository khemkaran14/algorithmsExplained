class Capacity {static long capacity(int[] a,int groups){long low=java.util.Arrays.stream(a).max().orElse(0),high=java.util.Arrays.stream(a).asLongStream().sum();
 while(low<high){long mid=low+(high-low)/2,load=0;int needed=1;
 for(int weight:a){if(load+weight>mid){needed++;load=0;}load+=weight;}
 if(needed<=groups)high=mid;
 else low=mid+1;}
 return low;}}
