function sort(a){if(!a.length)return [];
const min=Math.min(...a),max=Math.max(...a),counts=Array(max-min+1).fill(0);
for(const value of a)counts[value-min]++;
const out=[];
for(let i=0;i<counts.length;i++)for(let k=0;k<counts[i];k++)out.push(i+min);
return out;}
