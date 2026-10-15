def hash_key(text, m):
    h = 0
    for ch in text:
        h = (31*h + ord(ch)) % m
    # A bucket match is only a candidate.
    return h
