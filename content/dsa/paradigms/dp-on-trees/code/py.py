def independent_set(parents,weights):
    children=[[] for _ in parents]; dp=[[0,0] for _ in parents]
    for i in range(1,len(parents)): children[parents[i]].append(i)
    for u in range(len(parents)-1,-1,-1):
        dp[u][1]=weights[u]
        for v in children[u]: dp[u][1]+=dp[v][0]; dp[u][0]+=max(dp[v])
    selected=[]
    def recover(u,parent_included):
        include=not parent_included and dp[u][1]>dp[u][0]
        if include: selected.append(u)
        for v in children[u]: recover(v,include)
    recover(0,False)
    return max(dp[0]),selected
