function rangeSum(a,left,right){
const prefix=Array(a.length+1).fill(0);
for(let i=0;i<a.length;i++){
prefix[i+1]=prefix[i]+a[i];
}
return prefix[right]-prefix[left];}
