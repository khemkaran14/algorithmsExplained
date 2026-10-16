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
