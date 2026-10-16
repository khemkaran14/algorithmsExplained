def availability(components,topology,common=1,days=30):
    product=1
    for a in components:
        product*=a if topology=='series' else 1-a
    result=(product if topology=='series' else 1-product)*common
    return result,(1-result)*days*86400
