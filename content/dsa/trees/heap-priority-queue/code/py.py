class MaxHeap:
    def __init__(self,a=()):
        self.a=list(a)
        for i in range(len(a)//2-1,-1,-1): self.sink(i)
    def sink(self,i):
        a=self.a
        while 2*i+1<len(a):
            c=2*i+1
            if c+1<len(a) and a[c+1]>a[c]: c+=1
            if a[i]>=a[c]: break
            a[i],a[c]=a[c],a[i]; i=c
    def push(self,k):
        a=self.a; a.append(k); i=len(a)-1
        while i>0:
            p=(i-1)//2
            if a[p]>=a[i]: break
            a[p],a[i]=a[i],a[p]; i=p
    def pop(self):
        if not self.a: raise IndexError('empty')
        out=self.a[0]; last=self.a.pop()
        if self.a: self.a[0]=last; self.sink(0)
        return out
