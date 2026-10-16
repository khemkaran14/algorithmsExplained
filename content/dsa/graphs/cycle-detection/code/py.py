def has_cycle(adj,directed):
    color=[0]*len(adj)
    def visit(u,parent_edge=-1):
        color[u]=1
        for v,edge in adj[u]:
            if not directed and edge==parent_edge: continue
            if color[v]==0:
                if visit(v,edge): return True
            elif not directed or color[v]==1: return True
        color[u]=2
        return False
    return any(color[u]==0 and visit(u) for u in range(len(adj)))
