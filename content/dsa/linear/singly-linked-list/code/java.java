class LinkedListExample {
 static class Node {int value;Node next,prev;Node(int value){this.value=value;}}
 Node head,tail;
 void append(int value){Node n=new Node(value);if(tail!=null)tail.next=n;else head=n;tail=n;}
 boolean remove(int value){Node cur=head,prev=null;if(cur==null)return false;do{if(cur.value==value){if(cur==head&&cur==tail)head=tail=null;else{if(prev!=null)prev.next=cur.next;if(cur==head)head=cur.next;if(cur==tail)tail=prev;}cur.next=cur.prev=null;return true;}prev=cur;cur=cur.next;}while(cur!=null);return false;}
}

