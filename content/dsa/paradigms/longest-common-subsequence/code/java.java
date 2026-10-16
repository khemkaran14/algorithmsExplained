class Sequence {static int[][] table(String a,String b,boolean edit){int[][] dp=new int[a.length()+1][b.length()+1];if(edit){for(int i=0;i<=a.length();i++)dp[i][0]=i;for(int j=0;j<=b.length();j++)dp[0][j]=j;}
for(int i=1;i<=a.length();i++)for(int j=1;j<=b.length();j++){
if(a.charAt(i-1)==b.charAt(j-1))dp[i][j]=dp[i-1][j-1]+(edit?0:1);
else dp[i][j]=edit?1+Math.min(dp[i-1][j-1],Math.min(dp[i-1][j],dp[i][j-1])):Math.max(dp[i-1][j],dp[i][j-1]);}
// false: LCS length. true: unit-cost Levenshtein distance.
return dp;}}
