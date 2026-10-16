def activities(intervals):
    selected=[]; end=0
    for i,(start,finish) in sorted(enumerate(intervals),key=lambda p:(p[1][1],p[1][0],p[0])):
        if start>=end: selected.append(i); end=finish
    return selected
def fractional(items,capacity):
    taken=[]; value=0
    for i,item in sorted(enumerate(items),key=lambda p:(-p[1]['value']/p[1]['weight'],p[0])):
        if capacity<=0: break
        fraction=min(1,capacity/item['weight']); taken.append((i,fraction)); value+=fraction*item['value']; capacity=max(0,capacity-fraction*item['weight'])
    return value,taken
