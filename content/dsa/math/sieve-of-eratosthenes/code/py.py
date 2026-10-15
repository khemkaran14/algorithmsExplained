def primes(n):
    composite=[False]*(n+1);composite[0]=composite[1]=True
    p=2
    while p*p<=n:
        if not composite[p]:
            for multiple in range(p*p,n+1,p):composite[multiple]=True
        p+=1
    return [i for i in range(2,n+1) if not composite[i]]
