function bounds(a,target){
function boundary(upper){let low=0,high=a.length;
while(low<high){const mid=low+Math.floor((high-low)/2);
if(upper?a[mid]>target:a[mid]>=target)high=mid;
else low=mid+1;}return low;}
return [boundary(false),boundary(true)];}
