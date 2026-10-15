def owner(tokens, key_hash):
    lo, hi = 0, len(tokens)
    while lo < hi:
        mid = lo + (hi-lo)//2
        if tokens[mid][0] >= key_hash: hi = mid
        else: lo = mid+1
    return tokens[lo % len(tokens)][1]  # Sorted (unsigned hash, owner) tokens.
