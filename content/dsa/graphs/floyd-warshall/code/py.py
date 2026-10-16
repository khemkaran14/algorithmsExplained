def floyd(n,edges,directed=True):
    d=[[0 if i==j else float('inf') for j in range(n)] for i in range(n)]
    for u,v,w in edges:
        d[u][v]=min(d[u][v],w)
        if not directed: d[v][u]=min(d[v][u],w)
    for k in range(n):
        for i in range(n):
            for j in range(n): d[i][j]=min(d[i][j],d[i][k]+d[k][j])
    negative=[k for k in range(n) if d[k][k]<0]; out=[row[:] for row in d]
    for i in range(n):
        for j in range(n):
            if any(d[i][k]!=float('inf') and d[k][j]!=float('inf') for k in negative): out[i][j]=float('-inf')
    return out
