import java.math.BigInteger;
// TOY ARITHMETIC ONLY. These parameters are deliberately insecure.
class Toy {static long power(long base,long e,long m){
return BigInteger.valueOf(base).modPow(BigInteger.valueOf(e),BigInteger.valueOf(m)).longValueExact();}
static long[] agree(long a,long b){long A=power(5,a,23),B=power(5,b,23);
return new long[]{power(B,a,23),power(A,b,23)};}}
