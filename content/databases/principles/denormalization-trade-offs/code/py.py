def update(profile,orders,id,address,atomic=False,fail_after=-1):
    targets=[o for o in orders if o['customerId']==id]; fails=0<=fail_after<len(targets)
    if atomic and fails: return False,0
    profile[id]=address; copies=0
    for row in targets:
        if fails and copies>=fail_after: break
        row['address']=address; copies+=1
    return not fails,copies

def read(profile,order,normalized=False):
    truth=profile[order['customerId']]; address=truth if normalized else order['address']; return address,address!=truth

def repair(profile,orders):
    for row in orders: row['address']=profile[row['customerId']]
# Core sync/atomic update experiment; the player also includes queued propagation.
