def fibonacci(n,memo=False):
    cache={0:0,1:1}
    def fib(i):
        if i not in cache: cache[i]=fib(i-1)+fib(i-2)
        return cache[i]
    if memo: return str(fib(n))
    for i in range(2,n+1): cache[i]=cache[i-1]+cache[i-2]
    return str(cache[n])
