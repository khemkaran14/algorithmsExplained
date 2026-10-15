import java.util.ArrayDeque;
class StackDemo { static void demo(int[] values) { var stack = new ArrayDeque<Integer>();
  for(int value:values) stack.push(value);
  while(!stack.isEmpty()) {
    System.out.println(stack.pop()); }
} }
