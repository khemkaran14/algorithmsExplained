def breaker(events,threshold=2,cooldown=1000):
    state='closed'; failures=0; retry_at=0; history=[]
    for at,success in events:
        if state=='open' and at>=retry_at: state='half-open'
        called=state!='open'
        if called:
            if success: state='closed'; failures=0
            else:
                failures+=1
                if failures>=threshold or state=='half-open': state='open'; retry_at=at+cooldown
        history.append((at,called,state))
    return history
