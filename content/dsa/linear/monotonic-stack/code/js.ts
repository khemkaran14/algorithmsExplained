function nextGreater(a){const stack=[],out=Array(a.length).fill(null);
for(let i=0;i<a.length;i++){
while(stack.length&&a[stack.at(-1)]<a[i]){
out[stack.pop()]=a[i];}
stack.push(i);}
return out;}
