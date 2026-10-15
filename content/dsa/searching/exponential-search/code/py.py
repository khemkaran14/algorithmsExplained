def search(a, target):
    if not a: return -1
    if a[0] == target: return 0
    bound = 1
    while bound < len(a) and a[bound] < target: bound *= 2
    low, high = bound//2, min(bound,len(a)-1)
    while low <= high:
        mid = low+(high-low)//2
        if a[mid] == target: return mid
        if a[mid] < target: low=mid+1
        else: high=mid-1
    return -1
