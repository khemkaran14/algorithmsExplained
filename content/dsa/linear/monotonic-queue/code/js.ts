function windowMax(a,k){if(k<1||k>a.length)throw new RangeError('window');const q=[],out=[];let head=0;
for(let i=0;i<a.length;i++){while(head<q.length&&q[head]<=i-k)head++;
while(head<q.length&&a[q.at(-1)]<=a[i])q.pop();
if(head>0&&head*2>=q.length){q.splice(0,head);head=0;}
q.push(i);if(i>=k-1)out.push(a[q[head]]);}
return out;}
