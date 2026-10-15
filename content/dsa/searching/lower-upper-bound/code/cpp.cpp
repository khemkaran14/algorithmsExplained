#include <vector>
int boundary(const std::vector<int>& a,int target,bool upper){int low=0,high=(int)a.size();
while(low<high){int mid=low+(high-low)/2;
if(upper?a[mid]>target:a[mid]>=target)high=mid;else low=mid+1;}return low;}
std::vector<int> bounds(const std::vector<int>& a,int target){
return {boundary(a,target,false),boundary(a,target,true)};}
