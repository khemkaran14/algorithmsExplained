class Pair {static int[] find(int[] a,int target){int left=0,right=a.length-1;
while(left<right){
long sum=(long)a[left]+a[right];if(sum==target)return new int[]{left,right};
if(sum<target)left++;
else right--;}
return new int[]{};}}
