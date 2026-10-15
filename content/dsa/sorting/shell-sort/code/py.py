def sort(a):
    a = a[:]; gap = len(a)//2
    while gap:
        for i in range(gap, len(a)):
            key, j = a[i], i
            while j >= gap and a[j-gap] > key: a[j] = a[j-gap]; j -= gap
            a[j] = key
        gap //= 2
    return a
