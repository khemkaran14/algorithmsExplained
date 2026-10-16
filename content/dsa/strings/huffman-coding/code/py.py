import heapq
from collections import Counter
def huffman(text):
    heap=[]; serial=0
    for ch,count in sorted(Counter(text).items()): heapq.heappush(heap,(count,serial,ch)); serial+=1
    while len(heap)>1:
        a=heapq.heappop(heap); b=heapq.heappop(heap); heapq.heappush(heap,(a[0]+b[0],serial,(a[2],b[2]))); serial+=1
    codes={}
    def visit(n,prefix):
        if isinstance(n,str): codes[n]=prefix or '0'
        else: visit(n[0],prefix+'0'); visit(n[1],prefix+'1')
    visit(heap[0][2],'')
    return codes
