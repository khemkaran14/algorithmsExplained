class DynamicArray:
    def __init__(self): self.data=[None]; self.length=0
    def append(self,value):
        if self.length==len(self.data): self.data=self.data+[None]*len(self.data)
        self.data[self.length]=value; self.length+=1
    def values(self): return self.data[:self.length]
