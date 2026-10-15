function kmeans(points,centers,iterations){centers=centers.map(p=>[...p]);let groups=Array(points.length).fill(-1);
for(let step=0;step<iterations;step++){const next=points.map(p=>{let best=0;for(let c=1;c<centers.length;c++)if((p[0]-centers[c][0])**2+(p[1]-centers[c][1])**2<(p[0]-centers[best][0])**2+(p[1]-centers[best][1])**2)best=c;return best;});
const unchanged=next.every((g,i)=>g===groups[i]);groups=next;
centers=centers.map((old,c)=>{const members=points.filter((_,i)=>groups[i]===c);return members.length?[0,1].map(d=>members.reduce((s,p)=>s+p[d],0)/members.length):old;});
if(unchanged)break;}
return {centers,groups};}
