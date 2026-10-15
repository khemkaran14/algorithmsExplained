from collections import deque
def diameter(adj):
    def far(start):
        d=[-1]*len(adj); d[start]=0; q=deque([start]); best=start
        while q:
            u=q.popleft()
            if d[u]>d[best]: best=u
            for v in adj[u]:
                if d[v]==-1: d[v]=d[u]+1; q.append(v)
        return best,d[best]
    return far(far(0)[0])[1]
