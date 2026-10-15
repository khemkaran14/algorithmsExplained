def max_window(a,k):
    total=0;best=None
    for i,value in enumerate(a):
        total+=value
        if i>=k:total-=a[i-k]
        if i>=k-1:best=total if best is None else max(best,total)
    return best
