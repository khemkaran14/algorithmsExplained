class DSU {final int[] p,size;DSU(int n){p=new int[n];size=new int[n];for(int i=0;i<n;i++){p[i]=i;size[i]=1;}}
int find(int x){int r=x;while(r!=p[r])r=p[r];while(x!=r){int next=p[x];p[x]=r;x=next;}return r;}
boolean union(int a,int b){a=find(a);b=find(b);
if(a==b)return false;if(size[a]<size[b]){int t=a;a=b;b=t;}
p[b]=a;size[a]+=size[b];
return true;}}
