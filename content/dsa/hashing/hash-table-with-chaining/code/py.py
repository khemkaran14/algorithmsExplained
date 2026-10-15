class ChainedSet:
    def __init__(self, m=5): self.b = [[] for _ in range(m)]
    def has(self, k): return k in self.b[k % len(self.b)]
    def add(self, k):
        if not self.has(k): self.b[k % len(self.b)].append(k)
    def delete(self, k):
        b = self.b[k % len(self.b)]
        if k in b: b.remove(k)
