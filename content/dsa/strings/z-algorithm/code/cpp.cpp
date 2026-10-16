#include <string>
#include <vector>
#include <algorithm>
std::vector<int> zMatches(const std::string& text,const std::string& p){std::string s=p+char(0)+text;std::vector<int>z(s.size()),out;int left=0,right=-1;for(int i=1;i<(int)s.size();i++){if(i<=right)z[i]=std::min(right-i+1,z[i-left]);while(i+z[i]<(int)s.size()&&s[z[i]]==s[i+z[i]])z[i]++;if(i+z[i]-1>right){left=i;right=i+z[i]-1;}if(i>(int)p.size()&&z[i]>=(int)p.size())out.push_back(i-p.size()-1);}
// Null separator is unavailable in the printable ASCII input contract.
return out;}
