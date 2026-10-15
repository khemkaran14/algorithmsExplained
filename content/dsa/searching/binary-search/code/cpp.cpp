#include <vector>
int search(const std::vector<int>& a,int target){int low=0,high=(int)a.size()-1;while(low<=high){
  int mid=low+(high-low)/2;
  if(a[mid]==target)return mid;
  if(a[mid]<target)low=mid+1;else high=mid-1;}
  return -1;}
