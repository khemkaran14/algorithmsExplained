def place(keys, m, method='linear'):
    table, failed = [None]*m, []
    for key in keys:
        for t in range(m):
            i = (key % m + (t if method == 'linear' else t*t if method == 'quadratic' else t*(1+key%(m-1)))) % m
            if table[i] is None or table[i] == key:
                table[i] = key
                break
        else: failed.append(key)
    return table, failed
