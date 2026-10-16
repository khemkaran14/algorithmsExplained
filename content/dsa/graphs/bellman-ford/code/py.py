def bellman_ford(n,edges,start):
    d=[float('inf')]*n; d[start]=0
    for _ in range(n-1):
        changed=False
        for u,v,w in edges:
            if d[u]+w<d[v]: d[v]=d[u]+w; changed=True
        if not changed: break
    bad=set(v for u,v,w in edges if d[u]+w<d[v]); q=list(bad); adj=[[] for _ in range(n)]
    for u,v,w in edges: adj[u].append(v)
    for u in q:
        for v in adj[u]:
            if v not in bad: bad.add(v); q.append(v)
    return [float('-inf') if v in bad else d[v] for v in range(n)]
