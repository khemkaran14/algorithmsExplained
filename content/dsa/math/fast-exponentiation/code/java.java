import java.math.BigInteger;
class Power {static String power(int base,int exponent){BigInteger result=BigInteger.ONE,factor=BigInteger.valueOf(base);
while(exponent>0){if((exponent&1)==1)result=result.multiply(factor);
exponent/=2;
if(exponent>0)factor=factor.multiply(factor);}
return result.toString();}}
