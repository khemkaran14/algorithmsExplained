function sort(a){if(!a.length)return [];const shift=Math.min(...a);let v=a.map(x=>x-shift);
for(let exp=1,max=Math.max(...v);Math.floor(max/exp)>0;exp*=10){const c=Array(10).fill(0),out=Array(v.length);
for(const x of v)c[Math.floor(x/exp)%10]++;for(let i=1;i<10;i++)c[i]+=c[i-1];
for(let i=v.length-1;i>=0;i--)out[--c[Math.floor(v[i]/exp)%10]]=v[i];
v=out;}
return v.map(x=>x+shift);}
