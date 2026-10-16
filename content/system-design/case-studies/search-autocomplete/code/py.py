def suggest(dictionary,prefix,k):
    root={}
    for term in dictionary:
        node=root
        for ch in term['word']: node=node.setdefault(ch,{})
        node['$']=term
    node=root
    for ch in prefix:
        if ch not in node: return []
        node=node[ch]
    matches=[]
    def collect(n):
        if '$' in n: matches.append(n['$'])
        for ch,child in n.items():
            if ch!='$': collect(child)
    collect(node)
    return sorted(matches,key=lambda t:(-t['frequency'],t['word']))[:k]
