function capacity(weights,groups){let low=Math.max(...weights),high=weights.reduce((a,b)=>a+b,0);
while(low<high){const mid=low+Math.floor((high-low)/2);let needed=1,load=0;
for(const weight of weights){if(load+weight>mid){needed++;load=0;}load+=weight;}
if(needed<=groups)high=mid;
else low=mid+1;}
return low;}
