class Fenwick:
    def __init__(self,values):
        self.t=[0]*(len(values)+1)
        for i in range(1,len(self.t)):
            self.t[i]+=values[i-1]; p=i+(i&-i)
            if p<len(self.t): self.t[p]+=self.t[i]
    def add(self,index,delta):
        i=index+1
        while i<len(self.t): self.t[i]+=delta; i+=i&-i
    def prefix(self,end):
        total=0
        while end>0: total+=self.t[end]; end-=end&-end
        return total
    def sum(self,left,right): return self.prefix(right)-self.prefix(left)
