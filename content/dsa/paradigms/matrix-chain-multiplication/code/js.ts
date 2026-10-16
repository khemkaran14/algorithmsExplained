function matrixChain(d){const n=d.length-1,dp=Array.from({length:n},()=>Array(n).fill(0)),split=Array.from({length:n},()=>Array(n).fill(-1));
for(let length=2;length<=n;length++)for(let i=0;i+length<=n;i++){const j=i+length-1;dp[i][j]=Infinity;
for(let k=i;k<j;k++){const cost=dp[i][k]+dp[k+1][j]+d[i]*d[k+1]*d[j+1];
if(cost<dp[i][j]){dp[i][j]=cost;split[i][j]=k;}}}
function expression(i,j){if(i===j)return 'A'+(i+1);const k=split[i][j];return '('+expression(i,k)+'×'+expression(k+1,j)+')';}
return {cost:dp[0][n-1],expression:expression(0,n-1)};}
