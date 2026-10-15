def sort(a):
    if not a: return []
    low, high = min(a), max(a); counts = [0]*(high-low+1)
    for value in a: counts[value-low] += 1
    # Expand keys in frequency order.
    return [key+low for key, count in enumerate(counts) for _ in range(count)]
