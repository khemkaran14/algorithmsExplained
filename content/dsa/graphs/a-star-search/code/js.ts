class MinHeap {constructor(){this.a=[];}push(x){const a=this.a;a.push(x);let i=a.length-1;while(i>0){const p=Math.floor((i-1)/2);if(a[p][0]<=a[i][0])break;[a[p],a[i]]=[a[i],a[p]];i=p;}}pop(){const a=this.a,first=a[0],last=a.pop();if(a.length){a[0]=last;let i=0;while(2*i+1<a.length){let c=2*i+1;if(c+1<a.length&&a[c+1][0]<a[c][0])c++;if(a[i][0]<=a[c][0])break;[a[i],a[c]]=[a[c],a[i]];i=c;}}return first;}}
function shortest(adj,start,target=null,h=()=>0){const d=Array(adj.length).fill(Infinity),parent=Array(adj.length).fill(null),heap=new MinHeap();d[start]=0;heap.push([h(start),start,0]);
while(heap.a.length){const [priority,u,g]=heap.pop();if(g!==d[u])continue;if(u===target)break;
for(const [v,w]of adj[u]){if(w<0)throw Error('negative weight');const next=g+w;if(next<d[v]){d[v]=next;parent[v]=u;heap.push([next+h(v),v,next]);}}}
// For Dijkstra use h=0 and no target. For A*, h must be consistent and h(target)=0.
return {distance:d,parent};}
