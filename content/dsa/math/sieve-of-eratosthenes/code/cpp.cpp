#include <vector>
std::vector<int> primes(int n){std::vector<bool> composite(n+1);composite[0]=composite[1]=true;
for(int p=2;p<=n/p;p++){
if(!composite[p])for(int multiple=p*p;multiple<=n;multiple+=p)composite[multiple]=true;}
std::vector<int> out;for(int i=2;i<=n;i++)if(!composite[i])out.push_back(i);
return out;}
