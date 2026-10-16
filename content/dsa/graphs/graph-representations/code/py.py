def representations(n,edges,directed=False):
    adj=[[] for _ in range(n)]; matrix=[[None]*n for _ in range(n)]
    for u,v,w in edges:
        adj[u].append((v,w)); matrix[u][v]=w
        if not directed: adj[v].append((u,w)); matrix[v][u]=w
    return adj,matrix
