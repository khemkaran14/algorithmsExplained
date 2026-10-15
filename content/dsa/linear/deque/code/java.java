import java.util.ArrayDeque;
class Deque {
 private final ArrayDeque<Integer> values=new ArrayDeque<>();
 void pushFront(int value){values.addFirst(value);}void pushBack(int value){values.addLast(value);}
 int popFront(){return values.removeFirst();}
 int popBack(){return values.removeLast();}}
