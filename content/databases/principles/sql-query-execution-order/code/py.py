def join(customers,orders,kind='left'):
    out=[]; matched=set()
    for c in customers:
        found=False
        for i,o in enumerate(orders):
            if o['customerId'] is not None and o['customerId']==c['id']:
                found=True; matched.add(i); out.append(dict(customerId=c['id'],customerName=c['name'],orderId=o['id'],amount=o['amount']))
        if not found and kind in ['left','full']: out.append(dict(customerId=c['id'],customerName=c['name'],orderId=None,amount=None))
    if kind in ['right','full']:
        for i,o in enumerate(orders):
            if i not in matched: out.append(dict(customerId=None,customerName=None,orderId=o['id'],amount=o['amount']))
    return out
def query(customers,orders,min_amount,having_total,limit):
    rows=[r for r in join(customers,orders,'left') if r['amount'] is not None and r['amount']>=min_amount]; groups={}
    for row in rows:
        key=(row['customerId'],row['customerName']); g=groups.setdefault(key,dict(customerId=key[0],customerName=key[1],total=0,count=0)); g['total']+=row['amount']; g['count']+=1
    return sorted([g for g in groups.values() if g['total']>=having_total],key=lambda g:(-g['total'],g['customerId'],g['customerName']))[:limit]
