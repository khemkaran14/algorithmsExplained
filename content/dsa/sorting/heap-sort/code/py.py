def sort(a):
    a = a[:]
    def sift(i, n):
        while True:
            m, left, right = i, 2*i+1, 2*i+2
            if left < n and a[left] > a[m]: m = left
            if right < n and a[right] > a[m]: m = right
            if m == i: return
            a[i], a[m] = a[m], a[i]; i = m
    for i in range(len(a)//2-1, -1, -1): sift(i, len(a))
    for end in range(len(a)-1, 0, -1): a[0], a[end] = a[end], a[0]; sift(0, end)
    return a
