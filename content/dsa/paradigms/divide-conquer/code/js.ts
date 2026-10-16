function maximumSubarray(a){function solve(lo,hi){if(hi-lo===1)return {sum:a[lo],start:lo,end:hi};const mid=lo+Math.floor((hi-lo)/2),left=solve(lo,mid),right=solve(mid,hi);let sum=0,bestLeft=-Infinity,bestRight=-Infinity,start=mid-1,end=mid+1;
for(let i=mid-1;i>=lo;i--){sum+=a[i];if(sum>bestLeft){bestLeft=sum;start=i;}}
sum=0;for(let i=mid;i<hi;i++){sum+=a[i];if(sum>bestRight){bestRight=sum;end=i+1;}}
const cross={sum:bestLeft+bestRight,start,end};
return left.sum>=right.sum&&left.sum>=cross.sum?left:right.sum>=cross.sum?right:cross;}
return solve(0,a.length);}
