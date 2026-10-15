class Ring:
    def __init__(self,capacity):
        if capacity<1: raise ValueError('capacity')
        self.a=[None]*capacity; self.head=self.tail=self.size=0
    def enqueue(self,value):
        if self.size==len(self.a): raise OverflowError('Full')
        self.a[self.tail]=value; self.tail=(self.tail+1)%len(self.a); self.size+=1
    def dequeue(self):
        if not self.size: raise IndexError('Empty')
        value=self.a[self.head]; self.a[self.head]=None; self.head=(self.head+1)%len(self.a); self.size-=1
        return value
