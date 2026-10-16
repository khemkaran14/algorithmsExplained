import heapq
def prim(adj):
    seen=set(); total=0; components=0; chosen=[]
    for seed in range(len(adj)):
        if seed in seen: continue
        components+=1; heap=[(0,seed,-1)]
        while heap:
            weight,u,parent=heapq.heappop(heap)
            if u in seen: continue
            seen.add(u)
            if parent!=-1: total+=weight; chosen.append((parent,u,weight))
            for v,w in adj[u]:
                if v not in seen: heapq.heappush(heap,(w,v,u))
    return chosen,total,components
