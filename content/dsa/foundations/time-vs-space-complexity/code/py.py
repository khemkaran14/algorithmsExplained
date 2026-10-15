def duplicate_pairs(a):
    return any(a[i]==a[j] for i in range(len(a)) for j in range(i+1,len(a)))

def duplicate_set(a):
    seen=set()
    for key in a:
        if key in seen: return True
        seen.add(key)
    return False
