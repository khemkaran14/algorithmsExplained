import java.util.*;
class Sieve {static List<Integer> primes(int n){boolean[] composite=new boolean[n+1];composite[0]=composite[1]=true;
for(int p=2;p<=n/p;p++){
if(!composite[p])for(int multiple=p*p;multiple<=n;multiple+=p)composite[multiple]=true;}
var out=new ArrayList<Integer>();for(int i=2;i<=n;i++)if(!composite[i])out.add(i);
return out;}}
