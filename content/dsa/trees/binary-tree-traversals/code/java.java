import java.util.*;
class Traversal {static void visit(int[] a,int i,String order,List<Integer> out){if(i>=a.length)return;
if(order.equals("pre"))out.add(a[i]);visit(a,2*i+1,order,out);
if(order.equals("in"))out.add(a[i]);visit(a,2*i+2,order,out);
if(order.equals("post"))out.add(a[i]);}
static List<Integer> traverse(int[] a,String order){List<Integer> out=new ArrayList<>();if(order.equals("level")){for(int v:a)out.add(v);}else visit(a,0,order,out);return out;}}
