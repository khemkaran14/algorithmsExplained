def sort(a):
    a = a[:]
    for i in range(len(a)-1):
        m = min(range(i, len(a)), key=lambda j: a[j])
        a[i], a[m] = a[m], a[i]
    return a
