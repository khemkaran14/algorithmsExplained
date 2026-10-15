def search(a, target):
    low, high = 0, len(a)-1
    while low <= high:
        third = (high-low)//3; m1, m2 = low+third, high-third
        if a[m1] == target: return m1
        if a[m2] == target: return m2
        if target < a[m1]: high = m1-1
        elif target > a[m2]: low = m2+1
        else: low, high = m1+1, m2-1
    return -1
