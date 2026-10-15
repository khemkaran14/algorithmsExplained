def page_rank(adj,damping=.85,iterations=12):
    n=len(adj);rank=[1/n]*n
    for _ in range(iterations):
        dangling=sum(rank[u] for u in range(n) if not adj[u]);next_rank=[(1-damping)/n+damping*dangling/n]*n
        for u,neighbors in enumerate(adj):
            for v in neighbors:next_rank[v]+=damping*rank[u]/len(neighbors)
        rank=next_rank
    return rank
