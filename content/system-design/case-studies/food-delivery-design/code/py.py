def saga(orders,stock,couriers):
    rows=[dict(o,state='new',reserved=False,hold=False,courier=False,captured=False) for o in orders]; fulfilled=0
    def undo(o):
        nonlocal stock,couriers
        if o['courier']: couriers+=1; o['courier']=False
        o['hold']=False
        if o['reserved']: stock+=1; o['reserved']=False
        o['state']='compensated'
    for stage in ['reserve','authorize','assign','capture','reconcile','fulfill']:
        for o in rows:
            if stage=='reserve' and o['state']=='new':
                if stock: stock-=1; o['reserved']=True; o['state']='reserved'
                else: o['state']='rejected'
            if stage=='authorize' and o['state']=='reserved':
                if o['fault']=='authorization': undo(o)
                else: o['hold']=True; o['state']='authorized'
            if stage=='assign' and o['state']=='authorized':
                if not couriers or o['fault']=='courier': undo(o)
                else: couriers-=1; o['courier']=True; o['state']='assigned'
            if stage=='capture' and o['state']=='assigned':
                if o['fault']=='capture-failed': undo(o)
                elif o['fault']=='capture-uncertain': o['state']='pending'
                else: o['captured']=True; o['hold']=False; o['state']='captured'
            if stage=='reconcile' and o['state']=='pending' and o['reconcile']!='unknown':
                if o['reconcile']=='failed': undo(o)
                else: o['captured']=True; o['hold']=False; o['state']='captured'
            if stage=='fulfill' and o['state']=='captured':
                o['state']='fulfilled'; o['reserved']=False; fulfilled+=1
                if o['courier']: couriers+=1; o['courier']=False
    return rows,stock,couriers,fulfilled
