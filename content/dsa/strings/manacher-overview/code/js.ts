function manacher(s){const odd=Array(s.length).fill(0),even=[...odd];let bestStart=0,bestLength=1;
for(let parity=0;parity<2;parity++){const d=parity?even:odd;let left=0,right=-1;for(let i=0;i<s.length;i++){
let k=i>right?(parity?0:1):Math.min(d[left+right-i+(parity?1:0)],right-i+1);
while(i+k<s.length&&i-k-(parity?1:0)>=0&&s[i+k]===s[i-k-(parity?1:0)])k++;
d[i]=k;const start=i-k+(parity?0:1),length=2*k-(parity?0:1);if(length>bestLength){bestStart=start;bestLength=length;}if(i+k-1>right){left=start;right=i+k-1;}}}
return {odd,even,substring:s.slice(bestStart,bestStart+bestLength)};}
