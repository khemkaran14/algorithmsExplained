def dfs(adj,start):
    seen=set(); order=[]
    def visit(u):
        seen.add(u); order.append(u)
        for v in adj[u]:
            if v not in seen: visit(v)
    visit(start)
    return order
