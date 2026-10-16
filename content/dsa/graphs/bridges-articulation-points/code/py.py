def low_links(adj):
    discovery=[-1]*len(adj); low=[-1]*len(adj); bridges=[]; cuts=set(); time=0
    def visit(u,incoming=-1):
        nonlocal time
        discovery[u]=low[u]=time; time+=1; children=0
        for v,edge in adj[u]:
            if edge==incoming: continue
            if discovery[v]==-1:
                children+=1; visit(v,edge); low[u]=min(low[u],low[v])
                if low[v]>discovery[u]: bridges.append((u,v))
                if incoming!=-1 and low[v]>=discovery[u]: cuts.add(u)
            else: low[u]=min(low[u],discovery[v])
        if incoming==-1 and children>1: cuts.add(u)
    for u in range(len(adj)):
        if discovery[u]==-1: visit(u)
    return bridges,cuts
