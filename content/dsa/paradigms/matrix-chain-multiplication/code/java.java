class MatrixChain {static long cost(int[] d){int n=d.length-1;long[][] dp=new long[n][n];
for(int length=2;length<=n;length++)for(int i=0;i+length<=n;i++){int j=i+length-1;dp[i][j]=Long.MAX_VALUE;
for(int k=i;k<j;k++){long candidate=dp[i][k]+dp[k+1][j]+(long)d[i]*d[k+1]*d[j+1];
if(candidate<dp[i][j])dp[i][j]=candidate;}}
// Dimensions are positive bounded integers; multiplication is promoted to long.
return dp[0][n-1];}}
