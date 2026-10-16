class Links:
    def __init__(self): self.next=1; self.links={}; self.keys={}
    def create(self,key,url):
        if key in self.keys:
            old,code=self.keys[key]
            if old!=url: raise ValueError('key conflict')
            return code
        alphabet='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; n=self.next; self.next+=1; code=''
        while n: code=alphabet[n%62]+code; n//=62
        code=code.rjust(3,'0')
        if code in self.links: raise ValueError('unique constraint')
        self.links[code]=[url,True]; self.keys[key]=(url,code); return code
    def resolve(self,code):
        row=self.links.get(code); return row[0] if row and row[1] else None
    def revoke(self,code):
        if code in self.links: self.links[code][1]=False
