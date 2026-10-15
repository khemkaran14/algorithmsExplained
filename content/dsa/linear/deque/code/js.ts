class Deque {
constructor(){this.head=this.tail=null;}
pushFront(value){const node={value,prev:null,next:this.head};if(this.head)this.head.prev=node;else this.tail=node;this.head=node;}
pushBack(value){const node={value,prev:this.tail,next:null};if(this.tail)this.tail.next=node;else this.head=node;this.tail=node;}
popFront(){if(!this.head)throw new Error('Empty');const value=this.head.value;this.head=this.head.next;if(this.head)this.head.prev=null;else this.tail=null;return value;}
popBack(){if(!this.tail)throw new Error('Empty');const value=this.tail.value;this.tail=this.tail.prev;if(this.tail)this.tail.next=null;else this.head=null;return value;}
}
