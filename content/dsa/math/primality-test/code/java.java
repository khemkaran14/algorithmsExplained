class Prime {static boolean test(int n){if(n<2)return false;
for(int divisor=2;divisor<=n/divisor;divisor=divisor==2?3:divisor+2){
if(n%divisor==0)return false;
}
// Division-based bound avoids overflowing divisor*divisor.
return true;}}
