class Ring {
constructor(capacity){if(capacity<1)throw new RangeError('capacity');this.a=Array(capacity);this.head=this.tail=this.size=0;}
enqueue(value){if(this.size===this.a.length)throw new Error('Full');this.a[this.tail]=value;this.tail=(this.tail+1)%this.a.length;this.size++;}
dequeue(){if(!this.size)throw new Error('Empty');const value=this.a[this.head];this.a[this.head]=undefined;this.head=(this.head+1)%this.a.length;this.size--;return value;}
get length(){return this.size;}
}
