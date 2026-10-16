from collections import deque
def simulate(p,db_capacity=12,edge_cache=False):
    app,db=deque(),deque(); state=p['seed']; offered=completed=rejected=0
    def draw():
        nonlocal state
        state=(state*1664525+1013904223)&0xffffffff; return state%100
    for t in range(p['ticks']):
        outage=p['fault']!='none' and t>=p['failAt'] and (not p['restoreAt'] or t<p['restoreAt']); region=outage and p['fault']=='region'; cache_down=region and not edge_cache or outage and p['fault']=='cache'; db_down=region or outage and p['fault']=='database'; healthy=0 if region else p['replicas']-(1 if outage and p['fault']=='service' else 0)
        for _ in range(p['requests']):
            offered+=1
            if edge_cache and not cache_down and draw()<p['cacheHit']: completed+=1; continue
            if region or len(app)>=p['queueLimit']: rejected+=1
            else: app.append(1)
        for _ in range(healthy*p['capacity']*p['cpu']):
            if not app: break
            app.popleft()
            if not edge_cache and not cache_down and draw()<p['cacheHit']: completed+=1
            elif len(db)>=p['queueLimit']: rejected+=1
            else: db.append(1)
        if not db_down:
            for _ in range(db_capacity):
                if not db: break
                db.popleft(); completed+=1
    return {'offered':offered,'completed':completed,'pending':len(app)+len(db),'rejected':rejected}
