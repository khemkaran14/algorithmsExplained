function sort(a){a=[...a];function sift(i,n){for(;;){let m=i,l=2*i+1,r=l+1;
if(l<n&&a[l]>a[m])m=l;if(r<n&&a[r]>a[m])m=r;if(m===i)return;
[a[i],a[m]]=[a[m],a[i]];i=m;}}
for(let i=Math.floor(a.length/2)-1;i>=0;i--)sift(i,a.length);
for(let end=a.length-1;end>0;end--){[a[0],a[end]]=[a[end],a[0]];sift(0,end);}
return a;}
