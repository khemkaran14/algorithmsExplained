from functools import cmp_to_key

def indexed(rows,columns,filters,projection):
    sorted_rows=sorted(rows,key=lambda r:tuple(r[c] for c in columns)+(r['id'],)); prefix=[]
    for col in columns:
        if col not in filters: break
        prefix.append(col)
    covered=set(projection)|set(filters)<=set(columns)
    def compare(row):
        for col in prefix:
            if row[col]!=filters[col]: return row[col]-filters[col]
        return 0
    lo=0; hi=len(sorted_rows)
    while lo<hi:
        mid=(lo+hi)//2
        if compare(sorted_rows[mid])<0: lo=mid+1
        else: hi=mid
    start=lo; hi=len(sorted_rows)
    while lo<hi:
        mid=(lo+hi)//2
        if compare(sorted_rows[mid])<=0: lo=mid+1
        else: hi=mid
    candidates=sorted_rows[start:lo]; output=[{c:r[c] for c in projection} for r in candidates if all(r[k]==v for k,v in filters.items())]
    return dict(prefix=prefix,covered=covered,heapFetches=0 if covered else len(candidates),output=output)

import math
def estimate(n,percent,prefix,covered):
    candidates=n*percent/100 if prefix else n; seek=math.ceil(math.log2(math.ceil(n/4)+1)) if prefix else 0
    index=seek+math.ceil(candidates/4)+(0 if covered else 2*candidates); sequential=math.ceil(n/4)
    return index,sequential,'index' if index<sequential else 'sequential'
# Readable tuple-sorted reference with exact left-prefix bounds; no real EXPLAIN claims.
