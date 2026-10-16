def scc(adj,tarjan=True):
    n=len(adj); groups=[]
    if tarjan:
        index=[-1]*n; low=[-1]*n; active=[False]*n; stack=[]; time=0
        def visit(u):
            nonlocal time
            index[u]=low[u]=time; time+=1; stack.append(u); active[u]=True
            for v in adj[u]:
                if index[v]==-1: visit(v); low[u]=min(low[u],low[v])
                elif active[v]: low[u]=min(low[u],index[v])
            if low[u]==index[u]:
                group=[]
                while True:
                    v=stack.pop(); active[v]=False; group.append(v)
                    if v==u: break
                groups.append(group)
        for u in range(n):
            if index[u]==-1: visit(u)
        return groups
    seen=set(); finish=[]; reverse=[[] for _ in range(n)]
    for u,row in enumerate(adj):
        for v in row: reverse[v].append(u)
    def visit(u):
        seen.add(u)
        for v in adj[u]:
            if v not in seen: visit(v)
        finish.append(u)
    for u in range(n):
        if u not in seen: visit(u)
    seen.clear()
    for seed in reversed(finish):
        if seed in seen: continue
        stack=[seed]; seen.add(seed); group=[]
        while stack:
            u=stack.pop(); group.append(u)
            for v in reverse[u]:
                if v not in seen: seen.add(v); stack.append(v)
        groups.append(group)
    return groups
