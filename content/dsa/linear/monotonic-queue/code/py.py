from collections import deque

def window_max(a,k):
    if k<1 or k>len(a): raise ValueError('window')
    queue,out=deque(),[]
    for i,value in enumerate(a):
        while queue and queue[0]<=i-k: queue.popleft()
        while queue and a[queue[-1]]<=value: queue.pop()
        queue.append(i)
        if i>=k-1: out.append(a[queue[0]])
    return out
