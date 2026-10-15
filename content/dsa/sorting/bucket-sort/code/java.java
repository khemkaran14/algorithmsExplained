class Sort {
 static int[] sort(int[] input){
 int[] a=input.clone();
 if(a.length==0)return a;int low=java.util.Arrays.stream(a).min().getAsInt(),high=java.util.Arrays.stream(a).max().getAsInt(),k=(int)Math.ceil(Math.sqrt(a.length));java.util.List<java.util.List<Integer>> buckets=new java.util.ArrayList<>();for(int i=0;i<k;i++)buckets.add(new java.util.ArrayList<>());for(int x:a)buckets.get(Math.min(k-1,(int)((long)(x-low)*k/(high-low+1)))).add(x);int at=0;for(var b:buckets){for(int i=1;i<b.size();i++){int key=b.get(i),j=i-1;while(j>=0&&b.get(j)>key){b.set(j+1,b.get(j));j--;}b.set(j+1,key);}for(int x:b)a[at++]=x;}
 // Return the completed array.
 return a;}
 
}
