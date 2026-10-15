class Queue {
constructor(){this.head=this.tail=null;}
enqueue(value){const node={value,next:null};if(this.tail)this.tail.next=node;else this.head=node;this.tail=node;}
dequeue(){if(!this.head)throw new Error('Empty queue');const value=this.head.value;this.head=this.head.next;if(!this.head)this.tail=null;return value;}
isEmpty(){return this.head===null;}
}
