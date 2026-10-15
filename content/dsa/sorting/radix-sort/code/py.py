def sort(a):
    if not a: return []
    shift = min(a); values = [x-shift for x in a]; exp = 1
    while max(values)//exp:
        count, out = [0]*10, [0]*len(values)
        for x in values: count[x//exp%10] += 1
        for i in range(1,10): count[i] += count[i-1]
        for x in reversed(values): count[x//exp%10] -= 1; out[count[x//exp%10]] = x
        values = out; exp *= 10
    return [x+shift for x in values]
