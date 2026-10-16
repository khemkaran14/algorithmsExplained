# TOY ARITHMETIC ONLY. Use established authenticated protocols in production.
def power(base,e,m):
    out=1
    while e:
        if e&1: out=out*base%m
        e//=2
        if e: base=base*base%m
    return out
def round_trip(message):
    encrypted=power(message,17,3233)
    return encrypted,power(encrypted,2753,3233)
