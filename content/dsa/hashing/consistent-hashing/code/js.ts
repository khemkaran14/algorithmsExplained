function owner(sortedTokens,keyHash){let lo=0,hi=sortedTokens.length;
while(lo<hi){
const mid=lo+Math.floor((hi-lo)/2);
if(sortedTokens[mid].hash>=keyHash)hi=mid;else lo=mid+1;}
// Tokens are sorted unsigned hashes; caller hashes server replicas and keys consistently.
return sortedTokens[lo%sortedTokens.length].owner;}
