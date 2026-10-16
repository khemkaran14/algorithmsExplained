def apply(events,price,currency='INR'):
    seen={}; ledger=[]; history=[]; captured=0; refunded=0; state='created'
    for e in events:
        payload=(e['kind'],e['amount'],e['currency'])
        if e['id'] in seen: history.append('replayed' if seen[e['id']]==payload else 'event-conflict'); continue
        if e['currency']!=currency: history.append('currency-mismatch'); continue
        if e['kind']=='capture':
            if e['amount']!=price: history.append('amount-mismatch'); continue
            if not captured: captured=e['amount']; state='captured'; ledger.extend([('provider',captured),('liability',-captured)])
        elif e['kind']=='refund':
            if not captured: history.append('deferred-await-capture'); continue
            if e['amount']>captured-refunded: history.append('exceeds-refundable'); continue
            refunded+=e['amount']; state='refunded' if refunded==captured else 'partially-refunded'; ledger.extend([('provider',-e['amount']),('liability',e['amount'])])
        elif not captured: state='failed'
        seen[e['id']]=payload; history.append(state)
    return dict(state=state,captured=captured,refunded=refunded,ledger=ledger,entitled=captured>0 and refunded==0,history=history)
# Scope: trusted validated events for one order; persist each iteration transactionally.
