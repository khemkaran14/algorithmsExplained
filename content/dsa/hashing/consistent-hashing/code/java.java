class Ring {record Token(long hash,int owner){}static int owner(Token[] sorted,long keyHash){int lo=0,hi=sorted.length;
while(lo<hi){
int mid=lo+(hi-lo)/2;
if(sorted[mid].hash()>=keyHash)hi=mid;else lo=mid+1;}
// Hashes are unsigned 32-bit values stored in nonnegative longs.
return sorted[lo%sorted.length].owner();}}
