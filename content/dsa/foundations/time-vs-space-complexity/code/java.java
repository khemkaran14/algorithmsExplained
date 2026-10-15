import java.util.HashSet;
class Duplicates {
static boolean pairs(int[] a){for(int i=0;i<a.length;i++)for(int j=i+1;j<a.length;j++)if(a[i]==a[j])return true;return false;}
static boolean set(int[] a){var seen=new HashSet<Integer>();
for(int key:a)if(!seen.add(key))return true;
return false;}}
