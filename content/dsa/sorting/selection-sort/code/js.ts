function sort(a) { a=[...a];
for(let i=0;i<a.length-1;i++){
let min=i;for(let j=i+1;j<a.length;j++)if(a[j]<a[min])min=j;
[a[i],a[min]]=[a[min],a[i]];
}
return a;}
