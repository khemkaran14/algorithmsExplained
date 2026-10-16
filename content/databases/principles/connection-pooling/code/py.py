def pool(p):
    requests=[dict(r,id=i,state='future',end=None,start=None) for i,r in enumerate(p['requests'])]; connections=[]
    def acquire(r,tick):
        slot=next((c for c in connections if c['replica']==r['replica'] and c['request'] is None and not c['leaked']),None)
        if slot is None and len(connections)<p['databaseLimit'] and sum(c['replica']==r['replica'] for c in connections)<p['poolSize']:
            slot=dict(replica=r['replica'],request=None,leaked=False); connections.append(slot)
        if slot is None: return False
        slot['request']=r['id']; r['state']='running'; r['start']=tick; r['end']=tick+r['duration']; return True
    for tick in range(p['ticks']):
        for slot in connections:
            if slot['request'] is None or slot['leaked']: continue
            r=requests[slot['request']]
            if r['end']<=tick:
                r['state']='done'
                if r.get('leak',False): slot['leaked']=True
                else: slot['request']=None
        for r in requests:
            if r['state']=='waiting' and tick-r['at']>=p['timeout']: r['state']='timeout'
        for r in sorted((r for r in requests if r['state']=='waiting'),key=lambda r:(r['at'],r['id'])): acquire(r,tick)
        for r in requests:
            if r['state']!='future' or r['at']!=tick: continue
            waiting=sum(o['state']=='waiting' and o['replica']==r['replica'] for o in requests)
            if waiting or not acquire(r,tick): r['state']='rejected' if waiting>=p['queueLimit'] else 'waiting'
    return requests,connections
