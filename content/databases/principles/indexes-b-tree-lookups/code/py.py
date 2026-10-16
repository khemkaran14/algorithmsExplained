class Page:
    def __init__(self,keys=None,children=None): self.keys=keys or []; self.children=children or []; self.next=None
class PageTree:
    def __init__(self,plus=False): self.plus=plus; self.root=Page(); self.seen=set()
    def insert(self,p,k):
        i=0
        while i<len(p.keys) and (k>p.keys[i] or (self.plus and k==p.keys[i])): i+=1
        if p.children:
            split=self.insert(p.children[i],k)
            if split: key,right=split; p.keys.insert(i,key); p.children.insert(i+1,right)
        else: p.keys.insert(i,k)
        if len(p.keys)<=3: return None
        if self.plus and not p.children:
            right=Page(p.keys[2:]); p.keys=p.keys[:2]; right.next=p.next; p.next=right
            return right.keys[0],right
        key=p.keys[2]; right=Page(p.keys[3:],p.children[3:]); p.keys=p.keys[:2]; p.children=p.children[:3]
        return key,right
    def add(self,k):
        if k in self.seen: return
        self.seen.add(k); split=self.insert(self.root,k)
        if split: key,right=split; self.root=Page([key],[self.root,right])
    def has(self,k):
        p=self.root
        while True:
            i=0
            while i<len(p.keys) and k>p.keys[i]: i+=1
            if not p.children: return k in p.keys
            if i<len(p.keys) and p.keys[i]==k:
                if not self.plus: return True
                i+=1
            p=p.children[i]
