def total(a):
    result = 0
    for value in a: result += value
    # Each value contributes once.
    # No auxiliary list is needed.
    return result
