class Sort {
 static int[] sort(int[] input){
 int[] a=input.clone();
 if(a.length==0)return a;int low=java.util.Arrays.stream(a).min().getAsInt(),max=0;for(int i=0;i<a.length;i++){a[i]-=low;max=Math.max(max,a[i]);}for(long exp=1;max/exp>0;exp*=10){int[] count=new int[10],out=new int[a.length];for(int x:a)count[(int)(x/exp%10)]++;for(int i=1;i<10;i++)count[i]+=count[i-1];for(int i=a.length-1;i>=0;i--)out[--count[(int)(a[i]/exp%10)]]=a[i];a=out;}for(int i=0;i<a.length;i++)a[i]+=low;
 // Return the completed array.
 return a;}
 
}
