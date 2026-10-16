from collections import deque
def bfs(adj,start):
    distance=[None]*len(adj); distance[start]=0; queue=deque([start]); order=[]
    while queue:
        u=queue.popleft(); order.append(u)
        for v in adj[u]:
            if distance[v] is None: distance[v]=distance[u]+1; queue.append(v)
    return order,distance
