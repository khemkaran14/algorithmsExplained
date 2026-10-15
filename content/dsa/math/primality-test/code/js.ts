function isPrime(n){if(n<2)return false;
for(let d=2;d<=n/d;d=d===2?3:d+2){
if(n%d===0)return false;
}
// Every possible small factor was excluded.
return true;}
