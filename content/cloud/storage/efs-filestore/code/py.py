# A network partition alone must not release a lock held by a possibly live client.
class SharedFile:
    def __init__(self): self.value, self.epoch, self.lock = '', 0, None
    def acquire(self, client):
        if self.lock not in (None, client): return False
        self.lock = client; return True
    def read(self): return self.value, self.epoch
    def write(self, client, remembered, suffix, mode):
        if mode == 'lock' and self.lock != client: return False
        if mode == 'cas' and remembered[1] != self.epoch: return False
        self.value = (self.value if mode == 'lock' else remembered[0]) + suffix
        self.epoch += 1; return True
    def confirmed_crash(self, client):
        if self.lock == client: self.lock = None
