def factorial(n):
    if n<=1:
        return 1
    smaller=factorial(n-1)
    return n*smaller
# Each waiting call occupies one active stack frame.
