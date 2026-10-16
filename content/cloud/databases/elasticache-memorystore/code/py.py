from collections import OrderedDict
def cache_model(p):
    db={'a':{'value':1,'version':0},'b':{'value':2,'version':0}}; cache=OrderedDict(); reads=[]; lost=0
    def flush(key,e):
        if e['dirty']: db[key]={'value':e['value'],'version':e['version']}; e['dirty']=False
    def put(key,e):
        cache.pop(key,None)
        if len(cache)>=p['capacity']:
            old,value=cache.popitem(last=False); flush(old,value)
        cache[key]=e
    for tick,op in enumerate(p['operations']):
        for key,e in list(cache.items()):
            if e['expires']<=tick: flush(key,e); del cache[key]
        key=op['key']
        if op['kind']=='read':
            e=cache.get(key)
            if e: cache.move_to_end(key)
            elif key in db: e=dict(db[key],expires=tick+p['ttl'],dirty=False); put(key,e)
            reads.append((e['value'] if e else None,bool(e and key in db and e['version']<db[key]['version'])))
        elif op['kind']=='write':
            version=max(db.get(key,{}).get('version',0),cache.get(key,{}).get('version',0))+1; value=op['value']
            if p['strategy']=='write-back': put(key,dict(value=value,version=version,expires=tick+p['ttl'],dirty=True))
            else:
                db[key]=dict(value=value,version=version)
                if p['strategy']=='write-through': put(key,dict(value=value,version=version,expires=tick+p['ttl'],dirty=False))
                elif not p['loseInvalidation']: cache.pop(key,None)
        elif op['kind']=='invalidate':
            if key in cache: flush(key,cache[key]); del cache[key]
        elif op['kind']=='crash': lost+=sum(e['dirty'] for e in cache.values()); cache.clear()
    return db,reads,lost
