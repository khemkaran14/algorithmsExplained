function independentSet(parents,weights){const children=parents.map(()=>[]),dp=parents.map(()=>[0,0]);for(let i=1;i<parents.length;i++)children[parents[i]].push(i);
for(let u=parents.length-1;u>=0;u--){dp[u][1]=weights[u];
for(const v of children[u]){dp[u][1]+=dp[v][0];dp[u][0]+=Math.max(...dp[v]);}}
const selected=[];function recover(u,parentIncluded){const include=!parentIncluded&&dp[u][1]>dp[u][0];if(include)selected.push(u);for(const v of children[u])recover(v,include);}
recover(0,false);
return {value:Math.max(...dp[0]),selected};}
