from math import ceil, sqrt

def sort(a):
    if not a: return []
    low, high, k = min(a), max(a), ceil(sqrt(len(a))); buckets = [[] for _ in range(k)]
    for value in a: buckets[min(k-1, (value-low)*k//(high-low+1))].append(value)
    for bucket in buckets:
        for i in range(1,len(bucket)):
            key, j = bucket[i], i-1
            while j >= 0 and bucket[j] > key: bucket[j+1] = bucket[j]; j -= 1
            bucket[j+1] = key
    return [x for bucket in buckets for x in bucket]
