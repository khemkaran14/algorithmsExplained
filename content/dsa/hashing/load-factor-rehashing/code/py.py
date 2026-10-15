def growing_set(keys):
    m, size, b = 3, 0, [[], [], []]
    for key in keys:
        if key in b[key % m]: continue
        if (size+1)/m > .75:
            old = [v for chain in b for v in chain]
            m = 2*m+1
            b = [[] for _ in range(m)]
            for v in old: b[v % m].append(v)
        b[key % m].append(key)
        size += 1
    return b, size
