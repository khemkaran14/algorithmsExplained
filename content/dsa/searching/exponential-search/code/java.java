class Search {static int search(int[] a,int target){if(a.length==0)return -1;if(a[0]==target)return 0;
 int bound=1;while(bound<a.length&&a[bound]<target){if(bound>a.length/2){bound=a.length;break;}bound*=2;}
 int low=bound/2,high=Math.min(bound,a.length-1);
 while(low<=high){int mid=low+(high-low)/2;if(a[mid]==target)return mid;
 if(a[mid]<target)low=mid+1;else high=mid-1;}
 return -1;}}
