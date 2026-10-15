import java.util.ArrayDeque;
class NextGreater {static Integer[] nextGreater(int[] a){var stack=new ArrayDeque<Integer>();Integer[] out=new Integer[a.length];
for(int i=0;i<a.length;i++){
while(!stack.isEmpty()&&a[stack.peek()]<a[i])out[stack.pop()]=a[i];
stack.push(i);}
return out;}}
