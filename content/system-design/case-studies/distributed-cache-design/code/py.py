from collections import OrderedDict
class ReplicaCache:
    def __init__(self,nodes,capacity,ttl,owners): self.stores=[OrderedDict() for _ in range(nodes)]; self.origin={}; self.capacity=capacity; self.ttl=ttl; self.owners=owners
    def fill(self,node,key,row,tick):
        s=self.stores[node]; s.pop(key,None); s[key]=dict(row,expires=tick+self.ttl)
        if len(s)>self.capacity: s.popitem(last=False)
    def put(self,key,value,tick,healthy,origin_down=False):
        if origin_down: return False
        row=dict(value=value,version=self.origin.get(key,{}).get('version',0)+1); self.origin[key]=row
        for n in self.owners(key):
            if healthy(n): self.fill(n,key,row,tick)
        return True
    def get(self,key,tick,healthy,origin_down=False):
        for n in self.owners(key):
            if not healthy(n): continue
            s=self.stores[n]; row=s.pop(key,None)
            if row and row['expires']>tick: s[key]=row; return dict(row,source=n)
        if origin_down: return None
        row=self.origin.get(key,dict(value=key*10,version=0))
        for n in self.owners(key):
            if healthy(n): self.fill(n,key,row,tick)
        return dict(row,source='origin')
# owners(key) is a fixed-ring function returning distinct physical replica IDs.
