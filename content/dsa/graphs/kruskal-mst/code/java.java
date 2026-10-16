class DSU {final int[] p,size;DSU(int n){p=new int[n];size=new int[n];for(int i=0;i<n;i++){p[i]=i;size[i]=1;}}
int find(int x){int r=x;while(r!=p[r])r=p[r];while(x!=r){int next=p[x];p[x]=r;x=next;}return r;}
boolean union(int a,int b){a=find(a);b=find(b);
if(a==b)return false;if(size[a]<size[b]){int t=a;a=b;b=t;}
p[b]=a;size[a]+=size[b];
return true;}}
class Kruskal {record Forest(java.util.List<int[]> edges,long total,int components){}static Forest build(int n,int[][] edges){DSU dsu=new DSU(n);int[][] sorted=edges.clone();java.util.Arrays.sort(sorted,java.util.Comparator.comparingInt(e->e[2]));java.util.List<int[]> chosen=new java.util.ArrayList<>();long total=0;int components=n;for(int[] e:sorted)if(dsu.union(e[0],e[1])){chosen.add(e.clone());total+=e[2];components--;}return new Forest(chosen,total,components);}}
