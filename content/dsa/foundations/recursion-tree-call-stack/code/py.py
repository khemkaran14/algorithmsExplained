def fibonacci(n):
    if n<2: return n
    left=fibonacci(n-1)
    right=fibonacci(n-2)
    return left+right
# Equal subproblems are intentionally not memoized here.
