function join(customers,orders,kind='left'){const out=[],matched=new Set();
for(const c of customers){let found=false;orders.forEach((o,i)=>{if(o.customerId!==null&&o.customerId===c.id){found=true;matched.add(i);out.push({customerId:c.id,customerName:c.name,orderId:o.id,amount:o.amount});}});
if(!found&&['left','full'].includes(kind))out.push({customerId:c.id,customerName:c.name,orderId:null,amount:null});}
if(['right','full'].includes(kind))orders.forEach((o,i)=>{if(!matched.has(i))out.push({customerId:null,customerName:null,orderId:o.id,amount:o.amount});});
return out;}
// Every matching pair is emitted, preserving bag multiplicity. SQL NULL never equals a key.
// This explicit nested-loop reference omits indexing and optimizer transformations.
function query(customers,orders,minAmount,havingTotal,limit){const rows=join(customers,orders,'left').filter(r=>r.amount!==null&&r.amount>=minAmount),groups=new Map();
for(const row of rows){const key=JSON.stringify([row.customerId,row.customerName]),g=groups.get(key)||{customerId:row.customerId,customerName:row.customerName,total:0,count:0};g.total+=row.amount;g.count++;groups.set(key,g);}
return [...groups.values()].filter(g=>g.total>=havingTotal).sort((a,b)=>b.total-a.total||a.customerId-b.customerId||a.customerName.localeCompare(b.customerName)).slice(0,limit);}
// Logical FROM/JOIN → WHERE → GROUP → HAVING → SELECT/ORDER → LIMIT.
