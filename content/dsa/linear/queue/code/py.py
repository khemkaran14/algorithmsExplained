from collections import deque
class Queue:
    def __init__(self): self.values=deque()
    def enqueue(self,value): self.values.append(value)
    def dequeue(self): return self.values.popleft()
    def is_empty(self): return not self.values
