# TOY ARITHMETIC ONLY. Use established authenticated protocols in production.
def power(base,e,m):
    out=1
    while e:
        if e&1: out=out*base%m
        e//=2
        if e: base=base*base%m
    return out
def agree(a,b):
    A,B=power(5,a,23),power(5,b,23)
    return power(B,a,23),power(A,b,23)
