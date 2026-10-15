def next_greater(a):
    stack, out=[],[None]*len(a)
    for i,value in enumerate(a):
        while stack and a[stack[-1]]<value: out[stack.pop()]=value
        stack.append(i)
    return out
