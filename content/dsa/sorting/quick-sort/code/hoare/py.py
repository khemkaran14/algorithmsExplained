def quick_sort(a,lo=0,hi=None):
    if hi is None: hi=len(a)-1
    if lo>=hi: return a
    pivot=a[lo+(hi-lo)//2]; i=lo-1; j=hi+1
    while True:
        i+=1
        while a[i]<pivot: i+=1
        j-=1
        while a[j]>pivot: j-=1
        if i>=j: break
        a[i],a[j]=a[j],a[i]
    quick_sort(a,lo,j); quick_sort(a,j+1,hi)
    return a
