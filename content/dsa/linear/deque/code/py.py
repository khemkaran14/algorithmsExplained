from collections import deque
class Deque:
    def __init__(self): self.values=deque()
    def push_front(self,value): self.values.appendleft(value)
    def push_back(self,value): self.values.append(value)
    def pop_front(self): return self.values.popleft()
    def pop_back(self): return self.values.pop()
