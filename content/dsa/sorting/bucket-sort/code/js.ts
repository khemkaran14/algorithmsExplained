function sort(a){if(!a.length)return [];const min=Math.min(...a),max=Math.max(...a),k=Math.ceil(Math.sqrt(a.length)),b=Array.from({length:k},()=>[]);
for(const value of a)b[Math.min(k-1,Math.floor((value-min)/(max-min+1)*k))].push(value);
for(const a of b)for(let i=1;i<a.length;i++){const key=a[i];let j=i-1;
while(j>=0&&a[j]>key){a[j+1]=a[j];j--;}
a[j+1]=key;}
return b.flat();}
