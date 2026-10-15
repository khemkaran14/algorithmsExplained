function bfs(adj, start=0) { const seen=new Set([start]), queue=[start], order=[];
  let head=0; while(head<queue.length) {
    const node=queue[head++]; order.push(node);
    for(const next of adj[node]) if(!seen.has(next)) {
      seen.add(next); queue.push(next); } }
  return order; }
