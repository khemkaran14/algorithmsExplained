import java.math.BigInteger;
// TOY ARITHMETIC ONLY. These parameters are deliberately insecure.
class Toy {static long power(long base,long e,long m){
return BigInteger.valueOf(base).modPow(BigInteger.valueOf(e),BigInteger.valueOf(m)).longValueExact();}
static long[] roundTrip(long message){long encrypted=power(message,17,3233);
return new long[]{encrypted,power(encrypted,2753,3233)};}}
