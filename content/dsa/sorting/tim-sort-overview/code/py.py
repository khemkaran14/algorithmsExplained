def natural_merge(a):
    runs, start = [], 0
    while start<len(a):
        end=start+1; descending=end<len(a) and a[end]<a[start]
        while end<len(a) and (a[end]<a[end-1] if descending else a[end]>=a[end-1]): end+=1
        run=a[start:end]; runs.append(run[::-1] if descending else run); start=end
    def merge(left,right):
        out=[]; i=j=0
        while i<len(left) or j<len(right):
            if j==len(right) or (i<len(left) and left[i]<=right[j]): out.append(left[i]);i+=1
            else: out.append(right[j]);j+=1
        return out
    while len(runs)>1: runs=[merge(runs[i],runs[i+1]) if i+1<len(runs) else runs[i] for i in range(0,len(runs),2)]
    return runs[0] if runs else []
