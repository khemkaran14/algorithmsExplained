class Sort {
 static int[] sort(int[] input){
 int[] a=input.clone();
 quick(a,0,a.length-1);
 // Return the completed array.
 return a;}
 static void quick(int[] a,int lo,int hi){if(lo>=hi)return;int p=a[hi],i=lo;for(int j=lo;j<hi;j++)if(a[j]<=p){int t=a[i];a[i]=a[j];a[j]=t;i++;}int t=a[i];a[i]=a[hi];a[hi]=t;quick(a,lo,i-1);quick(a,i+1,hi);}
}
