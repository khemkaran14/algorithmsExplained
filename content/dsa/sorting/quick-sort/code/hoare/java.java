class QuickHoare {static void sort(int[] a,int lo,int hi){if(lo>=hi)return;
int pivot=a[lo+(hi-lo)/2],i=lo-1,j=hi+1;
while(true){do{i++;}while(a[i]<pivot);do{j--;}while(a[j]>pivot);if(i>=j)break;
int t=a[i];a[i]=a[j];a[j]=t;}
sort(a,lo,j);sort(a,j+1,hi);
}}
