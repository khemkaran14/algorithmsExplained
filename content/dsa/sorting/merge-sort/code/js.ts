function mergeSort(a) {
  if(a.length<2)return a;
  const mid=Math.floor(a.length/2),left=mergeSort(a.slice(0,mid)),right=mergeSort(a.slice(mid));
  const out=[];let i=0,j=0;
  while(i<left.length||j<right.length)out.push(j===right.length||(i<left.length&&left[i]<=right[j])?left[i++]:right[j++]);
  return out;
}
