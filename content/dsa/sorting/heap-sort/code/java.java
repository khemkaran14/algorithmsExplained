class Sort {
 static int[] sort(int[] input){
 int[] a=input.clone();
 for(int i=a.length/2-1;i>=0;i--)sift(a,i,a.length);for(int end=a.length-1;end>0;end--){int t=a[0];a[0]=a[end];a[end]=t;sift(a,0,end);}
 // Return the completed array.
 return a;}
 static void sift(int[] a,int i,int n){while(true){int m=i,l=2*i+1,r=l+1;if(l<n&&a[l]>a[m])m=l;if(r<n&&a[r]>a[m])m=r;if(m==i)return;int t=a[i];a[i]=a[m];a[m]=t;i=m;}}
}
