# Client cache TTL and reader permissions are independent of this rotation core.
class Rotation:
    def __init__(self):
        self.active, self.pending, self.next, self.validated, self.accepted = 1, None, 1, False, {1}
    def create(self):
        if self.pending is not None: return False
        self.next += 1; self.pending = self.next; self.validated = False; return True
    def configure(self, success):
        self.validated = False
        if self.pending is None or not success: return False
        self.accepted.add(self.pending); return True
    def validate(self, success):
        self.validated = self.pending is not None and self.pending in self.accepted and success
        return self.validated
    def promote(self):
        if self.pending is None or not self.validated or self.pending not in self.accepted: return False
        self.active = self.pending; self.pending = None; self.validated = False; return True
    def retire(self):
        if self.pending is not None: return False
        self.accepted = {self.active}; return True
    def authenticate(self, cached_version): return cached_version in self.accepted
