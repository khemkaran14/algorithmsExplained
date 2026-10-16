#include <string>
#include <vector>
#include <algorithm>
std::string longest(const std::string& s){std::vector<std::vector<int>>radii(2,std::vector<int>(s.size()));int bestStart=0,bestLength=1;for(int parity=0;parity<2;parity++){auto& d=radii[parity];int left=0,right=-1;for(int i=0;i<(int)s.size();i++){int k=i>right?(parity?0:1):std::min(d[left+right-i+(parity?1:0)],right-i+1);while(i+k<(int)s.size()&&i-k-(parity?1:0)>=0&&s[i+k]==s[i-k-(parity?1:0)])k++;d[i]=k;int start=i-k+(parity?0:1),length=2*k-(parity?0:1);if(length>bestLength){bestStart=start;bestLength=length;}if(i+k-1>right){left=start;right=i+k-1;}}}
// Input is nonempty printable ASCII, so byte and character indices coincide.
return s.substr(bestStart,bestLength);}
