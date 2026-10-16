import heapq
def shortest(adj,start,target=None,h=lambda u:0):
    distance=[float('inf')]*len(adj); parent=[None]*len(adj); distance[start]=0; heap=[(h(start),start,0)]
    while heap:
        priority,u,g=heapq.heappop(heap)
        if g!=distance[u]: continue
        if u==target: break
        for v,w in adj[u]:
            if w<0: raise ValueError('negative weight')
            nxt=g+w
            if nxt<distance[v]: distance[v]=nxt; parent[v]=u; heapq.heappush(heap,(nxt+h(v),v,nxt))
    return distance,parent  # A* requires consistent h; other unsettled distances may be tentative.
