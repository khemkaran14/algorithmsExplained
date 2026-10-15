function search(values,target){
for(let i=0;i<values.length;i++){
if(values[i]===target)return i;
}
// Every position was checked.
return -1;}
