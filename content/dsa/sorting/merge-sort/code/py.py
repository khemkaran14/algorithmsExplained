def merge_sort(a):
    if len(a) < 2: return a[:]
    mid = len(a)//2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
    out, i, j = [], 0, 0
    while i < len(left) or j < len(right):
        if j == len(right) or (i < len(left) and left[i] <= right[j]): out.append(left[i]); i += 1
        else: out.append(right[j]); j += 1
    return out
