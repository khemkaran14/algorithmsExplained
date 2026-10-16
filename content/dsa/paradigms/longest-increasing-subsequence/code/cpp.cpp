#include <vector>
#include <algorithm>
std::vector<int> lisIndices(const std::vector<int>& a){std::vector<int>tails,at,prev(a.size(),-1);for(unsigned i=0;i<a.size();i++){unsigned pos=std::lower_bound(tails.begin(),tails.end(),a[i])-tails.begin();prev[i]=pos?at[pos-1]:-1;if(pos==tails.size()){tails.push_back(a[i]);at.push_back(i);}else{tails[pos]=a[i];at[pos]=i;}}std::vector<int>out;
for(int i=at.back();i!=-1;i=prev[i])out.push_back(i);
std::reverse(out.begin(),out.end());
return out;}
