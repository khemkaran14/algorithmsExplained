function search(a,target){let low=0,high=a.length-1;
while(low<=high){const third=Math.floor((high-low)/3),m1=low+third,m2=high-third;
if(a[m1]===target)return m1;
if(a[m2]===target)return m2;
if(target<a[m1])high=m1-1;else if(target>a[m2])low=m2+1;else {low=m1+1;high=m2-1;}}
return -1;}
