class SumTree {final int n;final long[] t;SumTree(int[] values){int base=1;while(base<values.length)base*=2;n=base;t=new long[2*n];for(int i=0;i<values.length;i++)t[n+i]=values[i];for(int i=n-1;i>0;i--)t[i]=t[2*i]+t[2*i+1];}
void add(int i,int delta){i+=n;t[i]+=delta;
while(i>1){i/=2;t[i]=t[2*i]+t[2*i+1];}}
long sum(int left,int right){long out=0;for(left+=n,right+=n;left<right;left/=2,right/=2){
if(left%2==1)out+=t[left++];if(right%2==1)out+=t[--right];}
return out;}}
