#include <vector>
#include <unordered_set>
bool duplicatePairs(const std::vector<int>& a){for(int i=0;i<(int)a.size();i++)for(int j=i+1;j<(int)a.size();j++)if(a[i]==a[j])return true;return false;}
bool duplicateSet(const std::vector<int>& a){std::unordered_set<int> seen;
for(int key:a)if(!seen.insert(key).second)return true;
return false;}
