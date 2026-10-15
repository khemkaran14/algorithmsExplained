class Sort {
 static int[] sort(int[] input){
 int[] a=input.clone();
 if(a.length==0)return a;int low=java.util.Arrays.stream(a).min().getAsInt(),high=java.util.Arrays.stream(a).max().getAsInt();int[] count=new int[high-low+1];for(int x:a)count[x-low]++;int k=0;for(int i=0;i<count.length;i++)while(count[i]-->0)a[k++]=i+low;
 // Return the completed array.
 return a;}
 
}
