function lis(a){const tails=[],at=[],prev=Array(a.length).fill(-1);
for(let i=0;i<a.length;i++){let lo=0,hi=tails.length;while(lo<hi){const mid=lo+Math.floor((hi-lo)/2);if(tails[mid]<a[i])lo=mid+1;else hi=mid;}
prev[i]=lo?at[lo-1]:-1;tails[lo]=a[i];at[lo]=i;}
const indices=[];for(let i=at.at(-1);i!==-1;i=prev[i])indices.push(i);
indices.reverse();
return {length:tails.length,indices,values:indices.map(i=>a[i])};}
