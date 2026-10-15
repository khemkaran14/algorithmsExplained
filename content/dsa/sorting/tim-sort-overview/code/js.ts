function naturalMerge(a){a=[...a];let runs=[];
for(let start=0;start<a.length;){let end=start+1,descending=end<a.length&&a[end]<a[start];while(end<a.length&&(descending?a[end]<a[end-1]:a[end]>=a[end-1]))end++;let run=a.slice(start,end);if(descending)run.reverse();runs.push(run);start=end;}
function merge(l,r){let i=0,j=0,out=[];while(i<l.length||j<r.length)out.push(j===r.length||(i<l.length&&l[i]<=r[j])?l[i++]:r[j++]);return out;}
while(runs.length>1){let next=[];for(let i=0;i<runs.length;i+=2)next.push(i+1<runs.length?merge(runs[i],runs[i+1]):runs[i]);runs=next;}
// Teaching subset: natural runs and stable adjacent merging, without galloping.
return runs[0]??[];}
