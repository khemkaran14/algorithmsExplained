#include <vector>
#include <cstdint>
struct Token{uint32_t hash;int owner;};int owner(const std::vector<Token>& ring,uint32_t hash){unsigned lo=0,hi=ring.size();
while(lo<hi){unsigned mid=lo+(hi-lo)/2;if(ring[mid].hash>=hash)hi=mid;else lo=mid+1;}
// ring is nonempty and sorted by unsigned token hash.
return ring[lo%ring.size()].owner;}
