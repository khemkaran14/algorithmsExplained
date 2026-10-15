function compareSorts(input, algorithms){
const results={};
for(const [name,sort] of Object.entries(algorithms)){
const copy=[...input];
results[name]=sort(copy);}
return results;}
