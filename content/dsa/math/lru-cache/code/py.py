from collections import OrderedDict
class LRU:
    def __init__(self,capacity,loader=lambda key:key):self.capacity=capacity;self.loader=loader;self.cache=OrderedDict()
    def get(self,key):
        if key in self.cache:self.cache.move_to_end(key);return self.cache[key]
        value=self.loader(key)
        if len(self.cache)==self.capacity:self.cache.popitem(last=False)
        self.cache[key]=value
        return value
