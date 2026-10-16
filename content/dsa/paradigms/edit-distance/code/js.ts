function sequenceTable(a,b,edit=true){const dp=Array.from({length:a.length+1},(_,i)=>Array.from({length:b.length+1},(_,j)=>edit?(i===0?j:j===0?i:0):0));
for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){
if(a[i-1]===b[j-1])dp[i][j]=dp[i-1][j-1]+(edit?0:1);
else dp[i][j]=edit?1+Math.min(dp[i-1][j-1],dp[i-1][j],dp[i][j-1]):Math.max(dp[i-1][j],dp[i][j-1]);}
// The full table retains optimal predecessors for reconstruction.
return dp;}
