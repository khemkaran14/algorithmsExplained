function growingSet(keys){let m=3,size=0,b=Array.from({length:m},()=>[]);const index=k=>(k%m+m)%m;
for(const key of keys){if(b[index(key)].includes(key))continue;
if((size+1)/m>.75){const old=b.flat();m=2*m+1;b=Array.from({length:m},()=>[]);
for(const value of old)b[index(value)].push(value);}
b[index(key)].push(key);size++;}
return {b,size};}
