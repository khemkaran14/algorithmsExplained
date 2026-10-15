def is_prime(n):
    if n<2:return False
    divisor=2
    while divisor<=n//divisor:
        if n%divisor==0:return False
        divisor=3 if divisor==2 else divisor+2
    return True
