def simulate(routes,mode,capacity,ticks,payment_down=False,hop_cost=5):
    pending=[dict(route=r,id=i,stage=0) for i,r in enumerate(routes)]; completed=[]; failed=[]; overhead=0
    for tick in range(ticks):
        if mode=='monolith':
            budget=capacity; i=0
            while i<len(pending) and budget>0:
                r=pending[i]; work=1 if r['route']=='catalog' else 3
                if payment_down: failed.append(r['id']); pending.pop(i); continue
                if work>budget: i+=1; continue
                budget-=work; completed.append(r['id']); pending.pop(i)
        else:
            budgets=[max(1,capacity//3),capacity//3,capacity-max(1,capacity//3)-capacity//3]
            for stage in range(2,-1,-1):
                i=0
                while i<len(pending) and budgets[stage]>0:
                    r=pending[i]
                    if r['stage']!=stage: i+=1; continue
                    budgets[stage]-=1; overhead+=hop_cost if stage>0 else 0
                    if stage==2 and payment_down: failed.append(r['id']); pending.pop(i)
                    elif r['route']=='catalog' or stage==2: completed.append(r['id']); pending.pop(i)
                    else: r['stage']+=1; i+=1
    return completed,failed,[r['id'] for r in pending],overhead
