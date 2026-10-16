# Snapshot copies flushed data only; no real device is touched.
class Volume:
    def __init__(self, zone):
        self.zone, self.owner, self.disk, self.dirty = zone, None, {}, {}
    def attach(self, vm, zone):
        if zone != self.zone or self.owner not in (None, vm): return False
        self.owner = vm; return True
    def write(self, vm, block, value):
        if self.owner != vm: return False
        self.dirty[block] = value; return True
    def flush(self, vm):
        if self.owner != vm: return False
        self.disk.update(self.dirty); self.dirty.clear(); return True
    def crash(self, vm):
        if self.owner != vm: return 0
        lost = len(self.dirty); self.dirty.clear(); self.owner = None; return lost
    def snapshot(self): return self.disk.copy()
