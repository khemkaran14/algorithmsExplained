function indexed(rows,columns,filters,projection){const sorted=[...rows].sort((a,b)=>{for(const col of columns)if(a[col]!==b[col])return a[col]-b[col];return a.id-b.id;}),prefix=[];
for(const col of columns){if(!Object.hasOwn(filters,col))break;prefix.push(col);}const covered=[...projection,...Object.keys(filters)].every(col=>columns.includes(col));
const compare=row=>{for(const col of prefix)if(row[col]!==filters[col])return row[col]-filters[col];return 0;};let lo=0,hi=sorted.length;
while(lo<hi){const mid=(lo+hi)>>>1;if(compare(sorted[mid])<0)lo=mid+1;else hi=mid;}const start=lo;hi=sorted.length;while(lo<hi){const mid=(lo+hi)>>>1;if(compare(sorted[mid])<=0)lo=mid+1;else hi=mid;}
const candidates=sorted.slice(start,lo),output=candidates.filter(row=>Object.entries(filters).every(([k,v])=>row[k]===v)).map(row=>Object.fromEntries(projection.map(col=>[col,row[col]])));
return {prefix,covered,heapFetches:covered?0:candidates.length,candidates:candidates.length,output};}
function estimate(n,percent,prefix,covered){const candidates=prefix?n*percent/100:n,seek=prefix?Math.ceil(Math.log2(Math.ceil(n/4)+1)):0,index=seek+Math.ceil(candidates/4)+(covered?0:2*candidates),sequential=Math.ceil(n/4);return {index,sequential,plan:index<sequential?'index':'sequential'};}
// Explicit toy work units; build is for teaching, not per-query index rebuilding in production.
