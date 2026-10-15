def sort(a):
    a = a[:]
    def quick(lo, hi):
        if lo >= hi: return
        pivot, i = a[hi], lo
        for j in range(lo, hi):
            if a[j] <= pivot: a[i], a[j] = a[j], a[i]; i += 1
        a[i], a[hi] = a[hi], a[i]
        quick(lo, i-1); quick(i+1, hi)
    quick(0, len(a)-1)
    return a
