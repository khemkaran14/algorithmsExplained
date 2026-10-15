function sort(a){a=[...a];
for(let i=1;i<a.length;i++){
const key=a[i];let j=i-1;
while(j>=0&&a[j]>key){a[j+1]=a[j];j--;}
a[j+1]=key;}
return a;}
