function duplicatePairs(a){
for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)if(a[i]===a[j])return true;
return false;}
function duplicateSet(a){const seen=new Set();
for(const key of a){if(seen.has(key))return true;seen.add(key);}
return false;}
