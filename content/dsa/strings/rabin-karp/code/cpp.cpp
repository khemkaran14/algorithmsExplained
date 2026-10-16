#include <string>
#include <vector>
std::vector<int> rabinKarp(const std::string& text,const std::string& p){long long mod=1000000007,base=257,high=1,ph=0,wh=0;int m=p.size();std::vector<int>out;if(m>(int)text.size())return out;for(int i=0;i<m;i++){ph=(ph*base+(unsigned char)p[i])%mod;wh=(wh*base+(unsigned char)text[i])%mod;if(i<m-1)high=high*base%mod;}
for(int start=0;start+m<=(int)text.size();start++){if(ph==wh&&text.compare(start,m,p)==0)out.push_back(start);
if(start+m<(int)text.size()){wh=((wh-(unsigned char)text[start]*high)%mod+mod)%mod;wh=(wh*base+(unsigned char)text[start+m])%mod;}}
return out;}
