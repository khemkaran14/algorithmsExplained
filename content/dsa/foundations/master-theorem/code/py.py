from math import log

def recurrence_levels(a,b,k,n):
    levels=[]; nodes=1; total=0; level=0; size=n
    while size>=1:
        work=nodes*size**k; levels.append([level,nodes,size,work]);total+=work
        if size==1: break
        size//=b;nodes*=a;level+=1
    p=log(a,b);case=2 if abs(k-p)<1e-10 else 1 if k<p else 3
    return {'levels':levels,'case':case,'total':total}
