import java.util.*;
class Z {static List<Integer> matches(String text,String p){String s=p+(char)0+text;int[] z=new int[s.length()];int left=0,right=-1;List<Integer> out=new ArrayList<>();
for(int i=1;i<s.length();i++){if(i<=right)z[i]=Math.min(right-i+1,z[i-left]);while(i+z[i]<s.length()&&s.charAt(z[i])==s.charAt(i+z[i]))z[i]++;
if(i+z[i]-1>right){left=i;right=i+z[i]-1;}
if(i>p.length()&&z[i]>=p.length())out.add(i-p.length()-1);}
return out;}}
