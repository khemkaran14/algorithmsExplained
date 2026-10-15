def power(base,exponent):
    result=1
    while exponent>0:
        if exponent%2:result*=base
        exponent//=2
        if exponent>0:base*=base
    return str(result)
