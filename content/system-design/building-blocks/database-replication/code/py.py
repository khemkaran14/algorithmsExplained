class Register:
    def __init__(self,mode='eventual'): self.mode=mode; self.nodes=[(0,0,0),(0,0,0)]; self.pending=[]; self.sessions={}
    def allowed(self,node,client,partition):
        return not(self.mode=='strong' and partition) and not(self.mode=='session' and client in self.sessions and self.nodes[node][:2]<self.sessions[client][:2])
    def write(self,node,client,value,partition=False):
        if not self.allowed(node,client,partition): return False
        version=(self.nodes[node][0]+1,node,value); self.nodes[node]=version; self.sessions[client]=version
        if self.mode=='strong': self.nodes[1-node]=version
        else: self.pending.append((1-node,version))
        return True
    def read(self,node,client,partition=False):
        if not self.allowed(node,client,partition): return None
        version=self.nodes[node]
        if client not in self.sessions or version[:2]>self.sessions[client][:2]: self.sessions[client]=version
        return version[2]
    def deliver(self):
        for node,version in self.pending:
            if version[:2]>self.nodes[node][:2]: self.nodes[node]=version
        self.pending.clear()
