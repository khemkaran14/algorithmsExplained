function pair(a,target){let left=0,right=a.length-1;
while(left<right){
const sum=a[left]+a[right];if(sum===target)return [left,right];
if(sum<target)left++;
else right--;}
return [];}
