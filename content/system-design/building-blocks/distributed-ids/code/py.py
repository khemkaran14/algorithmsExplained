def generate(workers,events,policy='reject'):
    last=[-1]*len(workers); seq=[0]*len(workers); out=[]
    for worker,time in events:
        if time<last[worker]:
            if policy=='reject': out.append(None); continue
            time=last[worker]
        nxt=seq[worker]+1 if time==last[worker] else 0
        if nxt>=16:
            if policy=='reject': out.append(None); continue
            time=last[worker]+1; nxt=0
        last[worker]=time; seq[worker]=nxt; out.append(str((time<<7)|(workers[worker]<<4)|nxt))
    return out
