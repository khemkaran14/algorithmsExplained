def search(a, target):
    low, high = 0, len(a)-1
    while low <= high:
        mid = low + (high-low)//2
        if a[mid] == target: return mid
        if a[mid] < target: low = mid+1
        else: high = mid-1
    return -1
