class Sort {
 static int[] sort(int[] input){
 int[] a=input.clone();
 for(int gap=a.length/2;gap>0;gap/=2)for(int i=gap;i<a.length;i++){int key=a[i],j=i;while(j>=gap&&a[j-gap]>key){a[j]=a[j-gap];j-=gap;}a[j]=key;}
 // Return the completed array.
 return a;}
 
}
