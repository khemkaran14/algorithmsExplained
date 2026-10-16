class MVCC:
    def __init__(self,isolation='repeatable-read'):
        self.isolation=isolation; self.clock=0; self.versions={k:[dict(value=1,version=0,writer=None)] for k in ['x','y']}; self.transactions={}
    def begin(self,id):
        if id in self.transactions: raise ValueError('ID reused')
        self.transactions[id]=dict(snapshot=None,state='active',writes={},reads=[])
    def active(self,id):
        t=self.transactions[id]
        if t['state']!='active': raise ValueError('not active')
        if t['snapshot'] is None: t['snapshot']=self.clock
        return t
    def write(self,id,key,value): self.active(id)['writes'][key]=value
    def read(self,id,key):
        t=self.active(id)
        if key in t['writes']: return t['writes'][key]
        limit=t['snapshot'] if self.isolation in ['repeatable-read','serializable'] else self.clock
        row=next(v for v in reversed(self.versions[key]) if v['version']<=limit); t['reads'].append(dict(row,key=key)); return row['value']
    def cycle(self,candidate):
        nodes={id:t for id,t in self.transactions.items() if t['state']=='committed' or id==candidate}; edges=set(); next_version=self.clock+1
        def version(id,key): return next_version if id==candidate else next(v['version'] for v in self.versions[key] if v['writer']==id)
        for reader,t in nodes.items():
            for read in t['reads']:
                if read['writer'] and read['writer']!=reader: edges.add((read['writer'],reader))
                for writer,w in nodes.items():
                    if writer!=reader and read['key'] in w['writes'] and version(writer,read['key'])>read['version']: edges.add((reader,writer))
        for key in ['x','y']:
            writers=sorted([id for id,t in nodes.items() if key in t['writes']],key=lambda id:version(id,key))
            edges.update(zip(writers,writers[1:]))
        return ('A','B') in edges and ('B','A') in edges
    def commit(self,id):
        t=self.active(id); snapshot=self.isolation in ['repeatable-read','serializable']
        if (snapshot and any(self.versions[k][-1]['version']>t['snapshot'] for k in t['writes'])) or (self.isolation=='serializable' and self.cycle(id)):
            self.rollback(id); return False
        if t['writes']:
            self.clock+=1
            for key,value in t['writes'].items(): self.versions[key].append(dict(value=value,version=self.clock,writer=id))
        t['state']='committed'; return True
    def rollback(self,id):
        t=self.active(id); t['writes'].clear(); t['state']='aborted'
# Two IDs A/B, scalar x/y; explicit graph serializability, no full PostgreSQL SSI or WAL.
