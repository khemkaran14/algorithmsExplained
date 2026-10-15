function gcd(a,b){
while(b!==0){
const remainder=a%b;
a=b;
b=remainder;}
return a;}
