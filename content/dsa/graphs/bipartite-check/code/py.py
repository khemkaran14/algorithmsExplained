def bipartite(adj):
    color=[-1]*len(adj)
    for seed in range(len(adj)):
        if color[seed]>=0: continue
        color[seed]=0; q=[seed]; h=0
        while h<len(q):
            u=q[h]; h+=1
            for v in adj[u]:
                if color[v]==-1: color[v]=1-color[u]; q.append(v)
                elif color[v]==color[u]: return False
    return True
