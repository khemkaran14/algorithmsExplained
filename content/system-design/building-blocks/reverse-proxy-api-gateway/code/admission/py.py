class Limiter:
    def __init__(self,algorithm,limit,window_ms,refill): self.algorithm,self.limit,self.window,self.refill=algorithm,limit,window_ms,refill; self.clients={}
    def admit(self,at,key,cost=1):
        s=self.clients.setdefault(key,{'tokens':self.limit,'last':at,'window':at//self.window,'current':0,'previous':0,'log':[]})
        if self.algorithm=='token-bucket':
            s['tokens']=min(self.limit,s['tokens']+(at-s['last'])*self.refill/1000); s['last']=at; available=s['tokens']
        elif self.algorithm=='sliding-log':
            s['log']=[e for e in s['log'] if e[0]>at-self.window]; available=self.limit-sum(e[1] for e in s['log'])
        else:
            bucket=at//self.window
            if bucket!=s['window']: s['previous']=s['current'] if bucket==s['window']+1 else 0; s['current']=0; s['window']=bucket
            available=self.limit-s['current']-(s['previous']*(1-(at%self.window)/self.window) if self.algorithm=='sliding-counter' else 0)
        allowed=cost<=available+1e-12
        if allowed:
            if self.algorithm=='token-bucket': s['tokens']=max(0,s['tokens']-cost)
            elif self.algorithm=='sliding-log': s['log'].append((at,cost))
            else: s['current']+=cost
        return allowed
