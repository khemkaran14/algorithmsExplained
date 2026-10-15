function place(keys,m,method='linear'){const table=Array(m).fill(null),failed=[];
for(const key of keys){const start=(key%m+m)%m,step=1+(key%(m-1)+m-1)%(m-1);let stored=false;
for(let t=0;t<m;t++){const i=(start+(method==='linear'?t:method==='quadratic'?t*t:t*step))%m;
if(table[i]===null||table[i]===key){table[i]=key;stored=true;break;}}
if(!stored)failed.push(key);}
return {table,failed};}
