def stable_sort(keys):
    a = list(enumerate(keys))
    for i in range(1,len(a)):
        record, j = a[i], i-1
        while j>=0 and a[j][1]>record[1]: a[j+1]=a[j]; j-=1
        a[j+1]=record
    return a
