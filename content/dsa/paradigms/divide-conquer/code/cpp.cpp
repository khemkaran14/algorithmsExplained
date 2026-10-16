#include <vector>
#include <limits>
struct Answer{int sum,start,end;};Answer maximumSubarray(const std::vector<int>& a,int lo,int hi){if(hi-lo==1)return {a[lo],lo,hi};int mid=lo+(hi-lo)/2;auto left=maximumSubarray(a,lo,mid),right=maximumSubarray(a,mid,hi);int sum=0,bestLeft=std::numeric_limits<int>::min(),bestRight=bestLeft,start=mid-1,end=mid+1;
for(int i=mid-1;i>=lo;i--){sum+=a[i];if(sum>bestLeft){bestLeft=sum;start=i;}}sum=0;for(int i=mid;i<hi;i++){sum+=a[i];if(sum>bestRight){bestRight=sum;end=i+1;}}
Answer cross{bestLeft+bestRight,start,end};
return left.sum>=right.sum&&left.sum>=cross.sum?left:right.sum>=cross.sum?right:cross;}
