class Fenwick {final long[] t;Fenwick(int[] values){t=new long[values.length+1];for(int i=1;i<t.length;i++){t[i]+=values[i-1];int p=i+(i&-i);if(p<t.length)t[p]+=t[i];}}
void add(int index,int delta){
for(int i=index+1;i<t.length;i+=i&-i)t[i]+=delta;}
long prefix(int end){long sum=0;for(int i=end;i>0;i-=i&-i)sum+=t[i];return sum;}
long sum(int left,int right){
return prefix(right)-prefix(left);}}
