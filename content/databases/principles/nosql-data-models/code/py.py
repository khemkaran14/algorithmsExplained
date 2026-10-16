from bisect import bisect_left,bisect_right

def query(p):
    groups={}; adj={}; kv={}
    for row in p['rows']: groups.setdefault(row['owner'],[]).append(row); kv[row['id']]=row
    for rows in groups.values(): rows.sort(key=lambda r:(r['created'],r['id']))
    for a,b in p['friends']: adj.setdefault(a,[]).append(b)
    owners={p['owner']}; queue=[(p['owner'],0)]; head=0
    while head<len(queue):
        owner,depth=queue[head]; head+=1
        if depth>=p['depth']: continue
        neighbors=adj.get(owner,[]) if p['model']=='graph' else [b for a,b in p['friends'] if a==owner]
        for n in neighbors:
            if n not in owners: owners.add(n); queue.append((n,depth+1))
    candidates=[]
    if p['model'] in ['document','graph','wide-column'] or p['ownerIndex']:
        for owner in owners:
            rows=groups.get(owner,[])
            if p['model']=='wide-column':
                times=[r['created'] for r in rows]; rows=rows[bisect_left(times,p['minCreated']):bisect_right(times,p['maxCreated'])]
            candidates.extend(kv[r['id']] if p['model']=='key-value' else r for r in rows)
    else: candidates=p['rows']
    return sorted([r for r in candidates if r['owner'] in owners and p['minCreated']<=r['created']<=p['maxCreated'] and r['amount']>=p['minAmount']],key=lambda r:r['id'])
# Python builds a temporary time list for bisect; the player searches stored rows directly.
