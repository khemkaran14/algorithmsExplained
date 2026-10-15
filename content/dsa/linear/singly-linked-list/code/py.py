class Node:
    def __init__(self,value): self.value=value; self.next=self.prev=None
class LinkedList:
    def __init__(self): self.head=self.tail=None
    def append(self,value):
        node=Node(value)
        if self.tail: self.tail.next=node
        else: self.head=node
        self.tail=node
    def remove(self,value):
        cur,prev=self.head,None
        if cur is None: return False
        while True:
            if cur.value==value:
                if cur is self.head and cur is self.tail: self.head=self.tail=None
                else:
                    if prev: prev.next=cur.next
                    if cur is self.head: self.head=cur.next
                    if cur is self.tail: self.tail=prev
                cur.next=cur.prev=None
                return True
            prev,cur=cur,cur.next
            if cur is None: return False

