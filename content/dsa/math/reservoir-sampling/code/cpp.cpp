#include <vector>
#include <random>
std::vector<int> reservoir(const std::vector<int>& stream,int k,std::mt19937& random){std::vector<int> out(stream.begin(),stream.begin()+k);
for(int i=k;i<(int)stream.size();i++){std::uniform_int_distribution<int> draw(0,i);int j=draw(random);
if(j<k)out[j]=stream[i];}
return out;}
