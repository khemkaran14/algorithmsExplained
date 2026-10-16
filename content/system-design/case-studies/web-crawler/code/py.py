from urllib.parse import urlsplit,urlunsplit

def crawl(pages,seeds,robots=None,delay=2,workers=2,ticks=12):
    robots=robots or {}
    def canonical(s):
        u=urlsplit(s); return urlunsplit((u.scheme,u.netloc,u.path or '/',u.query,''))
    graph={canonical(p['url']):p['links'] for p in pages}; frontier=list(dict.fromkeys(map(canonical,seeds))); seen=set(frontier); next_host={}; history=[]
    for tick in range(ticks):
        budget=workers
        while budget:
            index=next((i for i,s in enumerate(frontier) if next_host.get(urlsplit(s).hostname,0)<=tick),None)
            if index is None: break
            url=frontier.pop(index); u=urlsplit(url)
            if any(u.path.startswith(prefix) for prefix in robots.get(u.hostname,[])): history.append((tick,url,'blocked')); continue
            budget-=1; next_host[u.hostname]=tick+delay; links=graph.get(url); history.append((tick,url,'visited' if links is not None else 'missing'))
            for raw in links or []:
                value=canonical(raw)
                if value not in seen: seen.add(value); frontier.append(value)
    return history,frontier,len(seen)
# Inputs are validated absolute HTTP(S) URLs; this function never performs I/O.
