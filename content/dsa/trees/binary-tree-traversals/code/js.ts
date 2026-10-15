function traverse(a,order='in'){const out=[];
function visit(i){if(i>=a.length)return;
if(order==='pre')out.push(a[i]);visit(2*i+1);
if(order==='in')out.push(a[i]);visit(2*i+2);
if(order==='post')out.push(a[i]);}
if(order==='level')return [...a];visit(0);return out;}
