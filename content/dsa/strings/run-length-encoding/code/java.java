import java.util.*;
class RLE {record Run(char character,int count){}static List<Run> encode(String text){List<Run> out=new ArrayList<>();
for(char ch:text.toCharArray()){int last=out.size()-1;
if(last>=0&&out.get(last).character()==ch)out.set(last,new Run(ch,out.get(last).count()+1));
else out.add(new Run(ch,1));}
return out;}}
