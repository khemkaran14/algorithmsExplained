function power(base,exponent){let result=1n,factor=BigInt(base);
while(exponent>0){
if(exponent%2)result*=factor;
exponent=Math.floor(exponent/2);
if(exponent>0)factor*=factor;}
return result.toString();}
