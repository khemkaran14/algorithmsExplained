import java.util.*;
class Reference {
static boolean glob(String pattern,String text){
  boolean[] row=new boolean[text.length()+1];row[0]=true;
  for(char token:pattern.toCharArray()){boolean[] next=new boolean[row.length];next[0]=token=='*'&&row[0];
    for(int j=1;j<row.length;j++)next[j]=token=='*'?(row[j]||next[j-1]):row[j-1]&&(token=='?'||token==text.charAt(j-1));row=next;}
  return row[text.length()];
}
record Statement(String action,String resource,String effect,boolean conditionsMatch) {}
static boolean allowed(List<Statement> statements,String action,String resource){
  boolean allow=false;for(Statement s:statements)if(glob(s.action,action)&&glob(s.resource,resource)&&s.conditionsMatch){if(s.effect.equals("deny"))return false;allow=true;}return allow;
}
}
