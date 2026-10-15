class Node:
    def __init__(self,k): self.k,self.l,self.r,self.h,self.red=k,None,None,1,True
class Tree:
    def height(self,n): return n.h if n else 0
    def fix(self,n): n.h=1+max(self.height(n.l),self.height(n.r)); return n
    def left(self,h):
        x=h.r; h.r=x.l; x.l=h; x.red=h.red; h.red=True; self.fix(h); return self.fix(x)
    def right(self,h):
        x=h.l; h.l=x.r; x.r=h; x.red=h.red; h.red=True; self.fix(h); return self.fix(x)
    def insert(self,h,k):
        if h is None: return Node(k)
        if k<h.k: h.l=self.insert(h.l,k)
        elif k>h.k: h.r=self.insert(h.r,k)
        else: return h
        self.fix(h)
        return self.fix(h)
    def add(self,k):
        self.root=self.insert(getattr(self,'root',None),k); self.root.red=False
    def has(self,k):
        n=getattr(self,'root',None)
        while n:
            if k==n.k: return True
            n=n.l if k<n.k else n.r
        return False
    def remove(self,n,k):
        if n is None: return None
        if k<n.k: n.l=self.remove(n.l,k)
        elif k>n.k: n.r=self.remove(n.r,k)
        else:
            if n.l is None: return n.r
            if n.r is None: return n.l
            s=n.r
            while s.l: s=s.l
            n.k=s.k; n.r=self.remove(n.r,s.k)
        return self.fix(n)
    def delete(self,k): self.root=self.remove(getattr(self,'root',None),k)

