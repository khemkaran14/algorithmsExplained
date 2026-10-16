def hash32(text):
    x=2166136261
    for ch in text: x=((x^ord(ch))*16777619)&0xffffffff
    x=((x^(x>>16))*0x85ebca6b)&0xffffffff; x=((x^(x>>13))*0xc2b2ae35)&0xffffffff
    return x^(x>>16)
def owners(nodes,keys,strategy='consistent',replicas=4):
    ring=sorted((hash32(f'node:{node}:{r}'),node) for node in nodes for r in range(replicas)); out=[]
    for key in keys:
        if strategy=='modulo': out.append(nodes[key%len(nodes)]); continue
        if strategy=='range': out.append(nodes[min(len(nodes)-1,key*len(nodes)//1000)]); continue
        value=hash32(f'key:{key}'); lo,hi=0,len(ring)
        while lo<hi:
            mid=lo+(hi-lo)//2
            if ring[mid][0]>=value: hi=mid
            else: lo=mid+1
        out.append(ring[lo%len(ring)][1])
    return out
