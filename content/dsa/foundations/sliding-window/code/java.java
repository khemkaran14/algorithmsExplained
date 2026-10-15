class Window {static long maximum(int[] a,int k){long sum=0,best=Long.MIN_VALUE;
for(int i=0;i<a.length;i++){
sum+=a[i];
if(i>=k)sum-=a[i-k];
if(i>=k-1)best=Math.max(best,sum);}
return best;}}
