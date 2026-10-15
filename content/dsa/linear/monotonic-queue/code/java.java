import java.util.*;
class WindowMax {static int[] maximum(int[] a,int k){if(k<1||k>a.length)throw new IllegalArgumentException();var queue=new ArrayDeque<Integer>();int[] out=new int[a.length-k+1];
for(int i=0;i<a.length;i++){while(!queue.isEmpty()&&queue.peekFirst()<=i-k)queue.removeFirst();
while(!queue.isEmpty()&&a[queue.peekLast()]<=a[i])queue.removeLast();
queue.addLast(i);if(i>=k-1)out[i-k+1]=a[queue.peekFirst()];}
return out;}}
