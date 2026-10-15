def range_sum(a,left,right):
    prefix=[0]
    for value in a:
        prefix.append(prefix[-1]+value)
    # The query is half-open: [left,right).
    return prefix[right]-prefix[left]
