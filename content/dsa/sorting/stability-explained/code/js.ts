function stableSort(records){const a=records.map((key,index)=>({key,index}));
for(let i=1;i<a.length;i++){
const record=a[i];let j=i-1;
while(j>=0&&a[j].key>record.key){a[j+1]=a[j];j--;}
a[j+1]=record;}
return a;}
