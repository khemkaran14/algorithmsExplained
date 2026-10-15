def capacity(weights, groups):
    low, high = max(weights), sum(weights)
    while low<high:
        mid=(low+high)//2; needed,load=1,0
        for weight in weights:
            if load+weight>mid: needed+=1;load=0
            load+=weight
        if needed<=groups: high=mid
        else: low=mid+1
    return low
