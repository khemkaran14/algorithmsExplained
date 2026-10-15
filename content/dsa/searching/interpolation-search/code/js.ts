function search(a,target){let low=0,high=a.length-1;
while(low<=high&&target>=a[low]&&target<=a[high]){
if(a[low]===a[high])return a[low]===target?low:-1;
const mid=low+Math.floor((target-a[low])*(high-low)/(a[high]-a[low]));if(a[mid]===target)return mid;
if(a[mid]<target)low=mid+1;else high=mid-1;}
return -1;}
