import java.util.*;
class MaxHeap {final ArrayList<Integer>a=new ArrayList<>();MaxHeap(int[] input){for(int k:input)a.add(k);for(int i=a.size()/2-1;i>=0;i--)sink(i);}
void sink(int i){while(2*i+1<a.size()){int c=2*i+1;if(c+1<a.size()&&a.get(c+1)>a.get(c))c++;if(a.get(i)>=a.get(c))break;Collections.swap(a,i,c);i=c;}}
void push(int k){a.add(k);int i=a.size()-1;while(i>0){int p=(i-1)/2;if(a.get(p)>=a.get(i))break;Collections.swap(a,p,i);i=p;}}
int pop(){if(a.isEmpty())throw new NoSuchElementException();int out=a.get(0),last=a.remove(a.size()-1);if(!a.isEmpty()){a.set(0,last);sink(0);}return out;}
}
