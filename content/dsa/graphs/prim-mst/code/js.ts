class MinHeap {constructor(){this.a=[];}push(x){const a=this.a;a.push(x);let i=a.length-1;while(i>0){const p=Math.floor((i-1)/2);if(a[p][0]<=a[i][0])break;[a[p],a[i]]=[a[i],a[p]];i=p;}}pop(){const a=this.a,first=a[0],last=a.pop();if(a.length){a[0]=last;let i=0;while(2*i+1<a.length){let c=2*i+1;if(c+1<a.length&&a[c+1][0]<a[c][0])c++;if(a[i][0]<=a[c][0])break;[a[i],a[c]]=[a[c],a[i]];i=c;}}return first;}}
function prim(adj){const seen=Array(adj.length).fill(false),heap=new MinHeap(),edges=[];let total=0,components=0;
for(let seed=0;seed<adj.length;seed++){if(seen[seed])continue;components++;heap.push([0,seed,-1]);
while(heap.a.length){const [w,u,from]=heap.pop();if(seen[u])continue;seen[u]=true;if(from!==-1){edges.push([from,u,w]);total+=w;}for(const [v,weight]of adj[u])if(!seen[v])heap.push([weight,v,u]);}}
// A disconnected input produces one tree per component.
return {edges,total,components};}
