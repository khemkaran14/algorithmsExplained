def hanoi(n,source='A',target='C',other='B'):
    if n==0:return []
    before=hanoi(n-1,source,other,target)
    move=[(source,target)]
    after=hanoi(n-1,other,target,source)
    return before+move+after
