import java.util.*;
class Greedy {static List<Integer> activities(int[][] intervals){Integer[] indices=new Integer[intervals.length];for(int i=0;i<indices.length;i++)indices[i]=i;Arrays.sort(indices,Comparator.comparingInt((Integer i)->intervals[i][1]).thenComparingInt(i->intervals[i][0]).thenComparingInt(i->i));List<Integer> selected=new ArrayList<>();int end=0;for(int i:indices)if(intervals[i][0]>=end){selected.add(i);end=intervals[i][1];}return selected;}
record Item(int weight,int value){}static double fractional(Item[] input,double capacity){Item[] items=input.clone();Arrays.sort(items,(a,b)->Long.compare((long)b.value()*a.weight(),(long)a.value()*b.weight()));double value=0;
for(Item item:items){if(capacity<=0)break;double fraction=Math.min(1,capacity/item.weight());value+=fraction*item.value();capacity=Math.max(0,capacity-fraction*item.weight());}
// Positive weights, nonnegative values, divisible items.
return value;}}
