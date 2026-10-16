def apply(requests,atomic=True):
    saved={}; ledger=[]; responses=[]
    for r in requests:
        if r['key'] in saved: responses.append('replayed' if saved[r['key']]==r['amount'] else 'conflict'); continue
        if atomic and r['outcome']=='crash-between': responses.append('rolled-back'); continue
        ledger.append((r['key'],r['amount']))
        if r['outcome']=='crash-between': responses.append('effect-without-record'); continue
        saved[r['key']]=r['amount']; responses.append('committed-response-lost' if r['outcome']=='response-lost' else 'ok')
    return ledger,responses
