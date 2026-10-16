def deliver(p):
    groups=p['subscribers'] if p['mode']=='pubsub' else 1
    tasks=[dict(m,group=g,state='ready',attempts=0,due=0) for m in p['messages'] for g in range(groups)]; inbox=set(); effects=[0]*groups; lost=False; deliveries=0
    for tick in range(p['ticks']):
        for t in tasks:
            if t['state']=='inflight' and t['due']<=tick: t['state']='dead' if t['attempts']>=p['maxRetries']+1 else 'ready'
        for group in range(groups):
            budget=p['workers']*p['perWorker']
            for t in tasks:
                if not budget: break
                if t['group']!=group or t['state']!='ready': continue
                budget-=1; t['state']='inflight'; t['due']=tick+p['visibility']; t['attempts']+=1; deliveries+=1
                if t['id']==p['failMessage'] or t['group']==p.get('failSubscriber',-1): continue
                key=(group,t['id'])
                if not p['deduplicate'] or key not in inbox: effects[group]+=t['value']; inbox.add(key)
                if p['loseFirstAck'] and not lost: lost=True
                else: t['state']='done'
    done=sum(t['state']=='done' for t in tasks); dead=sum(t['state']=='dead' for t in tasks)
    return effects,deliveries,done,dead,len(tasks)-done-dead
