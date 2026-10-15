def bounds(a, target):
    def boundary(upper):
        low, high = 0, len(a)
        while low < high:
            mid = low + (high-low)//2
            if (a[mid] > target if upper else a[mid] >= target): high = mid
            else: low = mid+1
        return low
    return [boundary(False), boundary(True)]
