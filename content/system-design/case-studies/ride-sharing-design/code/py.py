def assign(drivers,riders):
    available={d['id']:dict(d) for d in drivers}; out=[]
    for rider in riders:
        ranked=sorted(available.values(),key=lambda d:((d['x']-rider['x'])**2+(d['y']-rider['y'])**2,d['id']))
        best=ranked[0] if ranked else None
        if best: del available[best['id']]
        out.append(None if best is None else best['id'])
    return out
# Full-scan baseline; production reservations require atomic shared-state updates.
