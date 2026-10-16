def topological(adj,dfs=False):
    order=[]
    if dfs:
        color=[0]*len(adj)
        def visit(u):
            color[u]=1
            for v in adj[u]:
                if color[v]==1 or (color[v]==0 and not visit(v)): return False
            color[u]=2; order.append(u); return True
        for u in range(len(adj)):
            if color[u]==0 and not visit(u): return None
        return order[::-1]
    degree=[0]*len(adj)
    for row in adj:
        for v in row: degree[v]+=1
    q=[u for u,d in enumerate(degree) if d==0]; h=0
    while h<len(q):
        u=q[h]; h+=1; order.append(u)
        for v in adj[u]:
            degree[v]-=1
            if degree[v]==0: q.append(v)
    return order if len(order)==len(adj) else None
