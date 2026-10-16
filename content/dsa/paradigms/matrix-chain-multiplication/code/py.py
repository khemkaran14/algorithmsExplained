def matrix_chain(d):
    n=len(d)-1; dp=[[0]*n for _ in range(n)]; split=[[-1]*n for _ in range(n)]
    for length in range(2,n+1):
        for i in range(n-length+1):
            j=i+length-1; dp[i][j]=float('inf')
            for k in range(i,j):
                cost=dp[i][k]+dp[k+1][j]+d[i]*d[k+1]*d[j+1]
                if cost<dp[i][j]: dp[i][j]=cost; split[i][j]=k
    def expression(i,j):
        if i==j: return 'A'+str(i+1)
        k=split[i][j]; return '('+expression(i,k)+'×'+expression(k+1,j)+')'
    return dp[0][-1],expression(0,n-1)
