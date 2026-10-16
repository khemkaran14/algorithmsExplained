def max_flow(n,edges,source,sink,dfs=False):
    if source==sink: return 0
    adj=[[] for _ in range(n)]
    for u,v,capacity in edges:
        if u==v: continue
        a,b=len(adj[u]),len(adj[v]); adj[u].append([v,b,capacity]); adj[v].append([u,a,0])
    total=0
    while True:
        parent=[None]*n; seen={source}; q=[source]; head=0
        while (q if dfs else head<len(q)) and sink not in seen:
            if dfs: u=q.pop()
            else: u=q[head]; head+=1
            for i,(v,rev,capacity) in enumerate(adj[u]):
                if capacity>0 and v not in seen: seen.add(v); parent[v]=(u,i); q.append(v)
        if sink not in seen: break
        amount=float('inf'); v=sink
        while v!=source:
            u,i=parent[v]; amount=min(amount,adj[u][i][2]); v=u
        v=sink
        while v!=source:
            u,i=parent[v]; e=adj[u][i]; e[2]-=amount; adj[v][e[1]][2]+=amount; v=u
        total+=amount
    return total
