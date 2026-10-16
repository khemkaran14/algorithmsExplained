def minimum_cost(cost):
    dp=[]
    for i in range(len(cost)+1):
        one=0 if i==0 else dp[i-1]; two=0 if i<2 else dp[i-2]
        dp.append(min(one,two)+(cost[i] if i<len(cost) else 0))
    return dp[-1]
