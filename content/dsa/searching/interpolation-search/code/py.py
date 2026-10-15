def search(a, target):
    low, high = 0, len(a)-1
    while low<=high and a[low]<=target<=a[high]:
        if a[low]==a[high]: return low if a[low]==target else -1
        mid=low+(target-a[low])*(high-low)//(a[high]-a[low])
        if a[mid]==target: return mid
        if a[mid]<target: low=mid+1
        else: high=mid-1
    return -1
