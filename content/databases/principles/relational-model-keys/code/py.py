def constraints(customers,orders):
    ids=set(); order_ids=set(); errors=[]
    for c in customers:
        if c['id'] in ids: errors.append('duplicate customer')
        ids.add(c['id'])
    for o in orders:
        if o['id'] in order_ids: errors.append('duplicate order')
        order_ids.add(o['id'])
        if o['customerId'] is not None and o['customerId'] not in ids: errors.append('orphan customer')
    return errors
# NULL is permitted for the optional relationship; duplicate primary keys are never valid.
