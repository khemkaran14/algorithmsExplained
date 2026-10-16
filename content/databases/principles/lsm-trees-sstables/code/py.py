def hash32(text):
    h=2166136261
    for ch in text: h=((h^ord(ch))*16777619)&0xffffffff
    h=((h^(h>>16))*0x85ebca6b)&0xffffffff; h=((h^(h>>13))*0xc2b2ae35)&0xffffffff
    return (h^(h>>16))&0xffffffff
class LSM:
    def __init__(self,limit=3): self.limit=limit; self.sequence=0; self.mem={}; self.runs=[]
    def bits(self,key): return [hash32('a:'+str(key))%64,hash32('b:'+str(key))%64]
    def make(self,entries):
        rows=sorted(entries,key=lambda e:e['key']); return rows,{b for e in rows for b in self.bits(e['key'])}
    def put(self,key,value):
        self.sequence+=1; self.mem[key]=dict(key=key,value=value,sequence=self.sequence)
        if len(self.mem)>=self.limit: self.flush()
    def delete(self,key): self.put(key,None)
    def flush(self):
        if self.mem: self.runs.insert(0,self.make(self.mem.values())); self.mem.clear()
    def compact(self,full=False):
        if len(self.runs)<2: return
        start=0 if full else len(self.runs)-2; selected=self.runs[start:]; del self.runs[start:]; merged={}
        for entries,_ in selected:
            for e in entries:
                if e['key'] not in merged or e['sequence']>merged[e['key']]['sequence']: merged[e['key']]=e
        entries=[e for e in merged.values() if not full or e['value'] is not None]
        if entries: self.runs.insert(start,self.make(entries))
    def get(self,key,bloom=True):
        if key in self.mem: return self.mem[key]['value']
        for entries,bits in self.runs:
            if bloom and not all(b in bits for b in self.bits(key)): continue
            lo=0; hi=len(entries)
            while lo<hi:
                mid=(lo+hi)//2
                if entries[mid]['key']<key: lo=mid+1
                else: hi=mid
            if lo<len(entries) and entries[lo]['key']==key: return entries[lo]['value']
        return None
