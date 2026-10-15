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
        if h.r and h.r.red and not(h.l and h.l.red): h=self.left(h)
        if h.l and h.l.red and h.l.l and h.l.l.red: h=self.right(h)
        if h.l and h.l.red and h.r and h.r.red: h.red=not h.red; h.l.red=not h.l.red; h.r.red=not h.r.red
        return self.fix(h)
    def add(self,k):
        self.root=self.insert(getattr(self,'root',None),k); self.root.red=False

