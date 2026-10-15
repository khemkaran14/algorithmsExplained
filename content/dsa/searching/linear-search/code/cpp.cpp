#include <vector>
int search(const std::vector<int>& a,int target){
for(int i=0;i<(int)a.size();i++){
if(a[i]==target)return i;
}
return -1;}
