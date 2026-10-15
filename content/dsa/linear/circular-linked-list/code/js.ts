class LinkedList {
constructor(){this.head=this.tail=null;}
append(value){const n={value,next:null,prev:null};if(this.tail)this.tail.next=n;else this.head=n;this.tail=n;this.tail.next=this.head;}
remove(value){let cur=this.head,prev=this.tail;if(!cur)return false;do{if(cur.value===value){if(cur===this.head&&cur===this.tail)this.head=this.tail=null;else{if(prev)prev.next=cur.next;if(cur===this.head)this.head=cur.next;if(cur===this.tail)this.tail=prev;this.tail.next=this.head;}cur.next=cur.prev=null;return true;}prev=cur;cur=cur.next;}while(cur&&cur!==this.head);return false;}
// Node identity is distinct from its stored key.
}

