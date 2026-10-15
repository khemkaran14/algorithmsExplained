bool isPrime(int n){
if(n<2)return false;
for(int d=2;d<=n/d;d=d==2?3:d+2){
if(n%d==0)return false;}
// The division bound avoids overflowing d*d.
return true;}
