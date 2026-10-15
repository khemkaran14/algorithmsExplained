function search(a, target) {
  let low=0, high=a.length-1; while(low<=high) {
    const mid=low+Math.floor((high-low)/2);
    if(a[mid]===target) return mid;
    if(a[mid]<target) low=mid+1; else high=mid-1; }
  return -1; }
