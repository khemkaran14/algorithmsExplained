from collections import OrderedDict
class LFU:
    def __init__(self,capacity,loader=lambda key:key):self.capacity=capacity;self.loader=loader;self.cache={};self.buckets={};self.minimum=0
    def add(self,f,key):self.buckets.setdefault(f,OrderedDict())[key]=None
    def get(self,key):
        if key in self.cache:
            value,f=self.cache[key];del self.buckets[f][key]
            if not self.buckets[f]:del self.buckets[f];self.minimum+=int(self.minimum==f)
            self.cache[key]=(value,f+1);self.add(f+1,key);return value
        value=self.loader(key)
        if len(self.cache)==self.capacity:
            victim,_=self.buckets[self.minimum].popitem(last=False);del self.cache[victim]
            if not self.buckets[self.minimum]:del self.buckets[self.minimum]
        self.cache[key]=(value,1);self.add(1,key);self.minimum=1
        return value
