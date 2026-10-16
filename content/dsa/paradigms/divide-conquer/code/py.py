def maximum_subarray(a):
    def solve(lo,hi):
        if hi-lo==1: return a[lo],lo,hi
        mid=lo+(hi-lo)//2; left=solve(lo,mid); right=solve(mid,hi); total=0; best_left=best_right=float('-inf'); start=mid-1; end=mid+1
        for i in range(mid-1,lo-1,-1):
            total+=a[i]
            if total>best_left: best_left,start=total,i
        total=0
        for i in range(mid,hi):
            total+=a[i]
            if total>best_right: best_right,end=total,i+1
        return max([left,right,(best_left+best_right,start,end)],key=lambda x:x[0])
    return solve(0,len(a))
