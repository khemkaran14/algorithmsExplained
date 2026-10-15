class SumTree:
    def __init__(self,values):
        self.n=1
        while self.n<len(values): self.n*=2
        self.t=[0]*(2*self.n); self.t[self.n:self.n+len(values)]=values
        for i in range(self.n-1,0,-1): self.t[i]=self.t[2*i]+self.t[2*i+1]
    def add(self,i,delta):
        i+=self.n; self.t[i]+=delta
        while i>1:
            i//=2; self.t[i]=self.t[2*i]+self.t[2*i+1]
    def sum(self,left,right):
        left+=self.n; right+=self.n; out=0
        while left<right:
            if left%2: out+=self.t[left]; left+=1
            if right%2: right-=1; out+=self.t[right]
            left//=2; right//=2
        return out
