def quorum_round(configured,components,leaders,missing_since,tick,timeout,next_term):
    quorum=configured//2+1; commits=[]
    for group in components:
        key=tuple(group); known=sorted((n for n in group if n in leaders),key=lambda n:(-leaders[n],n))
        for old in known[1:]: del leaders[old]
        leader=known[0] if known else None
        if leader is None:
            missing_since.setdefault(key,tick)
            if len(group)>=quorum and tick-missing_since[key]>=timeout: next_term+=1; leader=min(group); leaders[leader]=next_term; del missing_since[key]
        else: missing_since.pop(key,None)
        if leader is not None and len(group)>=quorum: commits.append((leader,leaders[leader],len(group)))
    return commits,next_term
