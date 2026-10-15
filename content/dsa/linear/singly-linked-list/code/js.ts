class LinkedList {
constructor(){this.head=this.tail=null;}
append(value){const n={value,next:null,prev:null};if(this.tail)this.tail.next=n;else this.head=n;this.tail=n;}
remove(value){let cur=this.head,prev=null;if(!cur)return false;do{if(cur.value===value){if(cur===this.head&&cur===this.tail)this.head=this.tail=null;else{if(prev)prev.next=cur.next;if(cur===this.head)this.head=cur.next;if(cur===this.tail)this.tail=prev;}cur.next=cur.prev=null;return true;}prev=cur;cur=cur.next;}while(cur);return false;}
// Node identity is distinct from its stored key.
}

