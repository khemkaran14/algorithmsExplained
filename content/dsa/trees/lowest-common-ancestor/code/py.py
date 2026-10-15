def lca(parent,a,b):
    depth=[0]*len(parent)
    for i in range(1,len(parent)): depth[i]=depth[parent[i]]+1
    while depth[a]>depth[b]: a=parent[a]
    while depth[b]>depth[a]: b=parent[b]
    while a!=b: a,b=parent[a],parent[b]
    return a
