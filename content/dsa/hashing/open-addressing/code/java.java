import java.util.*;
class OpenAddressing {static Integer[] place(int[] keys,int m,String method){Integer[] table=new Integer[m];
for(int key:keys){int start=Math.floorMod(key,m),step=1+Math.floorMod(key,m-1);
for(int t=0;t<m;t++){int i=(start+(method.equals("linear")?t:method.equals("quadratic")?t*t:t*step))%m;
if(table[i]==null||table[i]==key){table[i]=key;break;}}}
// Inspect missing input keys to report failed insertions; m must be a small supported prime.
return table;}}
