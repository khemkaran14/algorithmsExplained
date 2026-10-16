import java.math.BigInteger;
class Fibonacci {static BigInteger fib(int n,BigInteger[] cache){if(cache[n]!=null)return cache[n];return cache[n]=fib(n-1,cache).add(fib(n-2,cache));}
static String fibonacci(int n,boolean memo){BigInteger[] cache=new BigInteger[Math.max(2,n+1)];cache[0]=BigInteger.ZERO;cache[1]=BigInteger.ONE;
if(memo)return fib(n,cache).toString();
for(int i=2;i<=n;i++)cache[i]=cache[i-1].add(cache[i-2]);
return cache[n].toString();}}
