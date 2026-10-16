class MaximumSubarray {record Answer(int sum,int start,int end){}static Answer solve(int[] a,int lo,int hi){if(hi-lo==1)return new Answer(a[lo],lo,hi);int mid=lo+(hi-lo)/2;Answer left=solve(a,lo,mid),right=solve(a,mid,hi);int sum=0,bestLeft=Integer.MIN_VALUE,bestRight=Integer.MIN_VALUE,start=mid-1,end=mid+1;
for(int i=mid-1;i>=lo;i--){sum+=a[i];if(sum>bestLeft){bestLeft=sum;start=i;}}
sum=0;for(int i=mid;i<hi;i++){sum+=a[i];if(sum>bestRight){bestRight=sum;end=i+1;}}
Answer cross=new Answer(bestLeft+bestRight,start,end);
return left.sum()>=right.sum()&&left.sum()>=cross.sum()?left:right.sum()>=cross.sum()?right:cross;
}}
