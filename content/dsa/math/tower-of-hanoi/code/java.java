import java.util.*;
class Hanoi {static void move(int n,char from,char to,char other,List<String> out){
if(n==0)return;move(n-1,from,other,to,out);
out.add(from+"->"+to);
move(n-1,other,to,from,out);}
static List<String> hanoi(int n){var out=new ArrayList<String>();move(n,'A','C','B',out);return out;}}
