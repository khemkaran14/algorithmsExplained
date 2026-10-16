import java.util.*;
class Naive {static List<Integer> matches(String text,String pattern){List<Integer> out=new ArrayList<>();
for(int i=0;i+pattern.length()<=text.length();i++){int j=0;
while(j<pattern.length()&&text.charAt(i+j)==pattern.charAt(j))j++;
if(j==pattern.length())out.add(i);}
return out;}}
