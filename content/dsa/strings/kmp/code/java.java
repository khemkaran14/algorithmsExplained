import java.util.*;
class KMP {static List<Integer> matches(String text,String p){int[] prefix=new int[p.length()];List<Integer> out=new ArrayList<>();
for(int i=1,j=0;i<p.length();){if(p.charAt(i)==p.charAt(j))prefix[i++]=++j;else if(j>0)j=prefix[j-1];else prefix[i++]=0;}
for(int i=0,j=0;i<text.length();){if(text.charAt(i)==p.charAt(j)){i++;j++;if(j==p.length()){out.add(i-j);j=prefix[j-1];}}else if(j>0)j=prefix[j-1];else i++;}
// Nonempty ASCII pattern and text use the lesson's index convention.
return out;}}
