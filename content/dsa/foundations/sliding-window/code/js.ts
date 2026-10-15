function maxWindow(a,k){let sum=0,best=-Infinity;
for(let i=0;i<a.length;i++){
sum+=a[i];
if(i>=k)sum-=a[i-k];
if(i>=k-1)best=Math.max(best,sum);}
return best;}
