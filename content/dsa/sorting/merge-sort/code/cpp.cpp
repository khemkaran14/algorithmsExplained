#include <vector>
std::vector<int> mergeSort(std::vector<int> a){
  if(a.size()<2)return a;auto mid=a.begin()+a.size()/2;
  auto left=mergeSort(std::vector<int>(a.begin(),mid)),right=mergeSort(std::vector<int>(mid,a.end()));
  std::vector<int> out;unsigned i=0,j=0;
  while(i<left.size()||j<right.size())out.push_back(j==right.size()||(i<left.size()&&left[i]<=right[j])?left[i++]:right[j++]);
  return out;
}
