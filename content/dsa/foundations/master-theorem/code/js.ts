function recurrenceLevels(a,b,k,n){const levels=[];let nodes=1,total=0;
for(let level=0,size=n;size>=1;level++,size/=b,nodes*=a){
const work=nodes*size**k;levels.push([level,nodes,size,work]);total+=work;
if(size===1)break;}
const p=Math.log(a)/Math.log(b),caseNumber=Math.abs(k-p)<1e-10?2:k<p?1:3;
return {levels,caseNumber,total};}
