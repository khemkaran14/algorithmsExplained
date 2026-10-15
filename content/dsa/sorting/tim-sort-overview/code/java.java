import java.util.*;
class NaturalMerge {
 static List<Integer> merge(List<Integer> a,List<Integer> b){var out=new ArrayList<Integer>();int i=0,j=0;while(i<a.size()||j<b.size())out.add(j==b.size()||(i<a.size()&&a.get(i)<=b.get(j))?a.get(i++):b.get(j++));return out;}
 static List<Integer> sort(int[] a){var runs=new ArrayList<List<Integer>>();for(int start=0;start<a.length;){int end=start+1;boolean down=end<a.length&&a[end]<a[start];while(end<a.length&&(down?a[end]<a[end-1]:a[end]>=a[end-1]))end++;var run=new ArrayList<Integer>();for(int i=start;i<end;i++)run.add(a[i]);if(down)Collections.reverse(run);runs.add(run);start=end;}
 while(runs.size()>1){var next=new ArrayList<List<Integer>>();for(int i=0;i<runs.size();i+=2)next.add(i+1<runs.size()?merge(runs.get(i),runs.get(i+1)):runs.get(i));runs=next;}
 return runs.isEmpty()?List.of():runs.get(0);}}
