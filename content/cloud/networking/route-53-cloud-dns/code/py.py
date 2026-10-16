# Health changes affect new authority responses, not answers already cached.
class Resolver:
    def __init__(self): self.cache = None
    def resolve(self, tick, records, ttl, negative_ttl):
        if self.cache and tick < self.cache['expires']:
            return dict(self.cache, source='cache')
        if not records:
            self.cache = dict(answers=[], status='NXDOMAIN', expires=tick+negative_ttl)
        else:
            answers = [address for address, healthy in records if healthy]
            if not answers: return dict(answers=[], status='no-healthy-answer', expires=None, source='authority')
            self.cache = dict(answers=answers, status='answer', expires=tick+ttl)
        return dict(self.cache, source='authority')
