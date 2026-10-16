def blockers(request,holders,earlier=()):
    own=holders.get(request['key'],{}).get(request['tx'])
    if own=='X' or (own=='S' and request['mode']=='S'): return set()
    out={owner for owner,mode in holders.get(request['key'],{}).items() if owner!=request['tx'] and (request['mode']=='X' or mode=='X')}
    out.update(p['tx'] for p in earlier if p['key']==request['key'] and p['tx']!=request['tx'] and (request['mode']=='X' or p['mode']=='X'))
    return out

def wait_graph(holders,queue): return [(r['tx'],to) for i,r in enumerate(queue) for to in blockers(r,holders,queue[:i])]

def victim(edges):
    active=[]; done=set(); found=[]
    def visit(n):
        nonlocal found
        if n in active: found=active[active.index(n):]; return True
        if n in done: return False
        active.append(n)
        for start,end in edges:
            if start==n and visit(end): return True
        active.pop(); done.add(n); return False
    for n in ['A','B','C']:
        if visit(n): break
    return max(found) if found else None
# The caller must abort/release the victim, then wake fair queued waiters.
