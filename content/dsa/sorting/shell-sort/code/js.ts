function sort(a){a=[...a];
for(let gap=Math.floor(a.length/2);gap>0;gap=Math.floor(gap/2)){
for(let i=gap;i<a.length;i++){const key=a[i];let j=i;
while(j>=gap&&a[j-gap]>key){a[j]=a[j-gap];j-=gap;}
a[j]=key;}}
return a;}
