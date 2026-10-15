class Prefix {
static long rangeSum(int[] a,int left,int right){long[] prefix=new long[a.length+1];
for(int i=0;i<a.length;i++){
prefix[i+1]=prefix[i]+a[i];
}
return prefix[right]-prefix[left];}}
