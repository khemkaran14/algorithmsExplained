import java.util.ArrayDeque;
class Queue {
 private final ArrayDeque<Integer> values=new ArrayDeque<>();
 void enqueue(int value){values.addLast(value);}
 int dequeue(){return values.removeFirst();}
 boolean isEmpty(){return values.isEmpty();}}
