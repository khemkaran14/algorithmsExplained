from collections import deque
def bfs(adj, start=0):
    seen, queue, order = {start}, deque([start]), []
    while queue:
        node=queue.popleft(); order.append(node)
        for nxt in adj[node]:
            if nxt not in seen: seen.add(nxt); queue.append(nxt)
    return order
