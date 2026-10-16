function quickSort(a,lo=0,hi=a.length-1){if(lo>=hi)return a;
const pivot=a[lo+Math.floor((hi-lo)/2)];let i=lo-1,j=hi+1;
while(true){do{i++;}while(a[i]<pivot);do{j--;}while(a[j]>pivot);if(i>=j)break;
[a[i],a[j]]=[a[j],a[i]];}
quickSort(a,lo,j);quickSort(a,j+1,hi);
return a;}
