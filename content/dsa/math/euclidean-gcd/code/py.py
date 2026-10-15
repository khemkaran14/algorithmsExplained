def gcd(a,b):
    while b:
        remainder=a%b
        a=b
        b=remainder
    return a
