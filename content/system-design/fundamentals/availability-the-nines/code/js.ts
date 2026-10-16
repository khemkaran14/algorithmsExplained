function availability(components,topology,common=1,days=30){let product=1;
for(const a of components){
product*=topology==='series'?a:1-a;}
const result=(topology==='series'?product:1-product)*common;
// Independence is assumed except for the explicit common failure factor.
return {availability:result,downtimeSeconds:(1-result)*days*86400};}
