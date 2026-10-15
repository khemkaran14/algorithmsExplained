#include <vector>
#include <algorithm>
int search(const std::vector<int>& a,int target){if(a.empty())return -1;if(a[0]==target)return 0;int bound=1;while(bound<(int)a.size()&&a[bound]<target){if(bound>(int)a.size()/2){bound=(int)a.size();break;}bound*=2;}int low=bound/2,high=std::min(bound,(int)a.size()-1);
while(low<=high){int mid=low+(high-low)/2;if(a[mid]==target)return mid;
if(a[mid]<target)low=mid+1;else high=mid-1;}
return -1;}
