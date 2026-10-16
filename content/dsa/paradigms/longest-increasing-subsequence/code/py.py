from bisect import bisect_left
def lis(a):
    tails=[]; at=[]; prev=[-1]*len(a)
    for i,value in enumerate(a):
        pos=bisect_left(tails,value); prev[i]=at[pos-1] if pos else -1
        if pos==len(tails): tails.append(value); at.append(i)
        else: tails[pos]=value; at[pos]=i
    indices=[]; i=at[-1]
    while i!=-1: indices.append(i); i=prev[i]
    return len(tails),indices[::-1]
