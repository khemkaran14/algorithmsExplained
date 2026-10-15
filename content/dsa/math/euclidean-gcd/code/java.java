class GCD {static long gcd(long a,long b){
while(b!=0){
long remainder=a%b;
a=b;
b=remainder;}
return a;}}
