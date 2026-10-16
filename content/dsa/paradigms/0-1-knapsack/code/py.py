def knapsack(weights,values,capacity):
    dp=[[0]*(capacity+1) for _ in range(len(weights)+1)]
    for i in range(1,len(weights)+1):
        for w in range(capacity+1): dp[i][w]=max(dp[i-1][w],values[i-1]+dp[i-1][w-weights[i-1]] if weights[i-1]<=w else -1)
    items=[]; w=capacity
    for i in range(len(weights),0,-1):
        if dp[i][w]!=dp[i-1][w]: items.append(i-1); w-=weights[i-1]
    return dp[-1][capacity],items[::-1]
