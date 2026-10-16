def feed(posts,followers,user,mode='hybrid',threshold=3):
    inbox={}; pull=set()
    for post in posts:
        audience={post['author']}|{f for f,a in followers if a==post['author']}; hot=len(audience)-1>=threshold
        if mode=='pull' or (mode=='hybrid' and hot): pull.add(post['author'])
        else:
            for reader in audience: inbox.setdefault(reader,{})[post['id']]=post
    authors={user}|{a for f,a in followers if f==user}; merged=dict(inbox.get(user,{}))
    for post in posts:
        if post['author'] in authors and post['author'] in pull: merged[post['id']]=post
    return sorted(merged.values(),key=lambda p:-p['sequence'])[:10]
# Drained worker baseline; queued propagation lag is modeled by the player.
