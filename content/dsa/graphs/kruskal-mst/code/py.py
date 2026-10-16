class DSU:
    def __init__(self,n): self.parent=list(range(n)); self.size=[1]*n
    def find(self,x):
        r=x
        while r!=self.parent[r]: r=self.parent[r]
        while x!=r: nxt=self.parent[x]; self.parent[x]=r; x=nxt
        return r
    def union(self,a,b):
        a,b=self.find(a),self.find(b)
        if a==b: return False
        if self.size[a]<self.size[b]: a,b=b,a
        self.parent[b]=a; self.size[a]+=self.size[b]
        return True
def kruskal(n,edges):
    dsu=DSU(n); chosen=[]; total=0; components=n
    for u,v,w in sorted(edges,key=lambda e:e[2]):
        if dsu.union(u,v): chosen.append((u,v,w)); total+=w; components-=1
    return chosen,total,components
