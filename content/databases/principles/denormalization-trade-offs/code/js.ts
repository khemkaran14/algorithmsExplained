function update(profile,orders,id,address,atomic=false,failAfter=-1){const targets=orders.filter(o=>o.customerId===id),fails=failAfter>=0&&failAfter<targets.length;
if(atomic&&fails)return {committed:false,copies:0};profile.set(id,address);let copies=0;
for(const row of targets){if(fails&&copies>=failAfter)break;row.address=address;copies++;}
return {committed:!fails,copies};}
function read(profile,order,normalized=false){const truth=profile.get(order.customerId),address=normalized?truth:order.address;return {address,stale:address!==truth};}
function repair(profile,orders){for(const row of orders)row.address=profile.get(row.customerId);}
// Synchronous fan-out core. The player additionally models durable-intent queued propagation.
// Addresses are duplicated CURRENT profiles, not historical shipping-address facts.
