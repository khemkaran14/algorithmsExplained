def traverse(a, order='in'):
    out=[]
    def visit(i):
        if i>=len(a): return
        if order=='pre': out.append(a[i])
        visit(2*i+1)
        if order=='in': out.append(a[i])
        visit(2*i+2)
        if order=='post': out.append(a[i])
    if order=='level': return list(a)
    visit(0)
    return out
