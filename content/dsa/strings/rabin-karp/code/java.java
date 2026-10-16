import java.util.*;
class RabinKarp {static List<Integer> matches(String text,String p){long mod=1000000007L,base=257,high=1,ph=0,wh=0;int m=p.length();List<Integer> out=new ArrayList<>();if(m>text.length())return out;
for(int i=0;i<m;i++){ph=(ph*base+p.charAt(i))%mod;wh=(wh*base+text.charAt(i))%mod;if(i<m-1)high=high*base%mod;}
for(int start=0;start+m<=text.length();start++){if(ph==wh&&text.regionMatches(start,p,0,m))out.add(start);
if(start+m<text.length()){wh=((wh-text.charAt(start)*high)%mod+mod)%mod;wh=(wh*base+text.charAt(start+m))%mod;}}
return out;}}
