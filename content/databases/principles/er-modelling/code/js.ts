function constraints(customers,orders){const ids=new Set(),orderIds=new Set(),errors=[];
for(const c of customers){if(ids.has(c.id))errors.push('duplicate customer '+c.id);ids.add(c.id);}
for(const o of orders){if(orderIds.has(o.id))errors.push('duplicate order '+o.id);orderIds.add(o.id);
if(o.customerId!==null&&!ids.has(o.customerId))errors.push('orphan customer '+o.customerId);}
return errors;}
// Customer.id and Order.id are primary keys. Order.customerId is a nullable foreign key.
// A real database enforces these constraints atomically, including concurrent writes.
