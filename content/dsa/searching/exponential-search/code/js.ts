function search(a,target){if(!a.length)return -1;if(a[0]===target)return 0;
let bound=1;while(bound<a.length&&a[bound]<target)bound*=2;
let low=Math.floor(bound/2),high=Math.min(bound,a.length-1);
while(low<=high){const mid=low+Math.floor((high-low)/2);if(a[mid]===target)return mid;
if(a[mid]<target)low=mid+1;else high=mid-1;}
return -1;}
