class Trie:
    def __init__(self): self.root={}
    def add(self,word):
        n=self.root
        for ch in word: n=n.setdefault(ch,{})
        n['$']=True
    def has(self,query,prefix=False):
        n=self.root
        for ch in query:
            if ch not in n: return False
            n=n[ch]
        return prefix or '$' in n
