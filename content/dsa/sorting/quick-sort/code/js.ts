function sort(a){a=[...a];function quick(lo,hi){if(lo>=hi)return;
const pivot=a[hi];let i=lo;
for(let j=lo;j<hi;j++)if(a[j]<=pivot){[a[i],a[j]]=[a[j],a[i]];i++;}
[a[i],a[hi]]=[a[hi],a[i]];
quick(lo,i-1);quick(i+1,hi);}quick(0,a.length-1);
return a;}
