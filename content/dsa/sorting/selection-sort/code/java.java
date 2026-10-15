class Sort {
 static int[] sort(int[] input){
 int[] a=input.clone();
 for(int i=0;i<a.length-1;i++){int m=i;for(int j=i+1;j<a.length;j++)if(a[j]<a[m])m=j;int t=a[i];a[i]=a[m];a[m]=t;}
 // Return the completed array.
 return a;}
 
}
