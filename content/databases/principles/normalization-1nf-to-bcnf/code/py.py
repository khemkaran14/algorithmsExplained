def analyze(attributes,dependencies):
    def closure(seed):
        out=set(seed); changed=True
        while changed:
            changed=False
            for fd in dependencies:
                if set(fd['left'])<=out:
                    for a in fd['right']:
                        if a not in out: out.add(a); changed=True
        return out
    keys=[]
    for mask in range(2**len(attributes)):
        subset={a for i,a in enumerate(attributes) if mask&(1<<i)}
        if set(attributes)<=closure(subset) and not any(set(k)<=subset for k in keys): keys.append(sorted(subset))
    prime=set().union(*map(set,keys)); bcnf=[]; third=[]; partial=[]
    for fd in dependencies:
        superkey=set(attributes)<=closure(fd['left'])
        for a in set(fd['right'])-set(fd['left']):
            if not superkey:
                bcnf.append((fd['left'],a))
                if a not in prime: third.append((fd['left'],a))
    for key in keys:
        for mask in range(2**len(key)-1):
            subset={a for i,a in enumerate(key) if mask&(1<<i)}
            partial.extend((sorted(subset),a) for a in closure(subset)-prime)
    return keys,prime,partial,third,bcnf
