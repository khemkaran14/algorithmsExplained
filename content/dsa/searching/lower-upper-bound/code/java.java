class Bounds {
 static int boundary(int[] a,int target,boolean upper){int low=0,high=a.length;
 while(low<high){int mid=low+(high-low)/2;
 if(upper?a[mid]>target:a[mid]>=target)high=mid;else low=mid+1;}
 return low;}
 static int[] bounds(int[] a,int target){return new int[]{boundary(a,target,false),boundary(a,target,true)};}}
