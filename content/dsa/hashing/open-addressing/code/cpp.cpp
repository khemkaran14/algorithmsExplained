#include <vector>
#include <optional>
#include <string>
std::vector<std::optional<int>> place(const std::vector<int>& keys,int m,const std::string& method){std::vector<std::optional<int>> table(m);for(int key:keys){int start=(key%m+m)%m,step=1+(key%(m-1)+m-1)%(m-1);
for(int t=0;t<m;t++){int i=(start+(method=="linear"?t:method=="quadratic"?t*t:t*step))%m;if(!table[i]||*table[i]==key){table[i]=key;break;}}}
return table;} // Supported small prime capacities; callers must handle failed insertions.
