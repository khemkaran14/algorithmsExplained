import java.util.*;
class Floyd {static double[][] shortest(int n,int[][] edges,boolean directed){double[][] d=new double[n][n];for(int i=0;i<n;i++){Arrays.fill(d[i],Double.POSITIVE_INFINITY);d[i][i]=0;}for(int[] e:edges){d[e[0]][e[1]]=Math.min(d[e[0]][e[1]],e[2]);if(!directed)d[e[1]][e[0]]=Math.min(d[e[1]][e[0]],e[2]);}
for(int k=0;k<n;k++)for(int i=0;i<n;i++)for(int j=0;j<n;j++)d[i][j]=Math.min(d[i][j],d[i][k]+d[k][j]);
double[][] out=new double[n][];for(int i=0;i<n;i++)out[i]=d[i].clone();for(int k=0;k<n;k++)if(d[k][k]<0)for(int i=0;i<n;i++)for(int j=0;j<n;j++)if(Double.isFinite(d[i][k])&&Double.isFinite(d[k][j]))out[i][j]=Double.NEGATIVE_INFINITY;
// Preserve d while propagating affected pairs into a separate matrix.
return out;}}
