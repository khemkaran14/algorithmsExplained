def sequence_table(a,b,edit=False):
    dp=[[j if i==0 else i if j==0 else 0 for j in range(len(b)+1)] if edit else [0]*(len(b)+1) for i in range(len(a)+1)]
    for i in range(1,len(a)+1):
        for j in range(1,len(b)+1):
            if a[i-1]==b[j-1]: dp[i][j]=dp[i-1][j-1]+(0 if edit else 1)
            else: dp[i][j]=1+min(dp[i-1][j-1],dp[i-1][j],dp[i][j-1]) if edit else max(dp[i-1][j],dp[i][j-1])
    return dp
