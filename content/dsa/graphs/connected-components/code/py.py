def components(adj):
    label=[-1]*len(adj); count=0
    for seed in range(len(adj)):
        if label[seed]>=0: continue
        label[seed]=count; stack=[seed]
        while stack:
            for v in adj[stack.pop()]:
                if label[v]==-1: label[v]=count; stack.append(v)
        count+=1
    return count,label
