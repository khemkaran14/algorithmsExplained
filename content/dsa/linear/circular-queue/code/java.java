class Ring {
 private final int[] a;private int head=0,tail=0,size=0;
 Ring(int capacity){if(capacity<1)throw new IllegalArgumentException();a=new int[capacity];}
 void enqueue(int value){if(size==a.length)throw new IllegalStateException("Full");a[tail]=value;tail=(tail+1)%a.length;size++;}
 int dequeue(){if(size==0)throw new IllegalStateException("Empty");int value=a[head];head=(head+1)%a.length;size--;return value;}
 int size(){return size;}}
