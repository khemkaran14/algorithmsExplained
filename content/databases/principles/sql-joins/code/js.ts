function join(customers,orders,kind='left'){const out=[],matched=new Set();
for(const c of customers){let found=false;orders.forEach((o,i)=>{if(o.customerId!==null&&o.customerId===c.id){found=true;matched.add(i);out.push({customerId:c.id,customerName:c.name,orderId:o.id,amount:o.amount});}});
if(!found&&['left','full'].includes(kind))out.push({customerId:c.id,customerName:c.name,orderId:null,amount:null});}
if(['right','full'].includes(kind))orders.forEach((o,i)=>{if(!matched.has(i))out.push({customerId:null,customerName:null,orderId:o.id,amount:o.amount});});
return out;}
// Every matching pair is emitted, preserving bag multiplicity. SQL NULL never equals a key.
// This explicit nested-loop reference omits indexing and optimizer transformations.
