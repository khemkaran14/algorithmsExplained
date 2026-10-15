class Bloom:
    def __init__(self, m, k, positions): self.bits, self.k, self.positions = [False]*m, k, positions
    def add(self, key):
        for i in self.positions(key, len(self.bits), self.k): self.bits[i] = True
    def maybe(self, key):
        for i in self.positions(key, len(self.bits), self.k):
            if not self.bits[i]: return False
        return True  # Use identical deterministic hash positions for both operations.
