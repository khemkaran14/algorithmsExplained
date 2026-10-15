def sort(a):
    a = a[:]
    for i in range(1, len(a)):
        key, j = a[i], i-1
        while j >= 0 and a[j] > key: a[j+1] = a[j]; j -= 1
        a[j+1] = key
    return a
