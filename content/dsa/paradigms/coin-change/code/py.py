def coin_change(coins,amount,combinations=False):
    coins=sorted(set(coins)); dp=[0 if combinations else float('inf')]*(amount+1); dp[0]=1 if combinations else 0
    if combinations:
        for coin in coins:
            for a in range(coin,amount+1): dp[a]+=dp[a-coin]
    else:
        for a in range(1,amount+1):
            for coin in coins:
                if coin<=a: dp[a]=min(dp[a],dp[a-coin]+1)
    return None if dp[amount]==float('inf') else dp[amount]
