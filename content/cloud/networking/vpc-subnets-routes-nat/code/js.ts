// Inputs are validated canonical IPv4 CIDRs. This helper does not create NAT mappings.
function ip(value){return value.split('.').reduce((n,v)=>n*256+Number(v),0);}
function contains(cidr,address){const [network,prefix]=cidr.split('/'),size=2**(32-Number(prefix));return Math.floor(ip(network)/size)===Math.floor(ip(address)/size);}
function route(routes,destination){return routes.filter(r=>contains(r.cidr,destination)).sort((a,b)=>Number(b.cidr.split('/')[1])-Number(a.cidr.split('/')[1])||a.priority-b.priority)[0]??null;}
function statelessAllowed(rules,direction,peer,port,protocol){
  const rule=rules.filter(r=>r.direction===direction&&contains(r.cidr,peer)&&port>=r.from&&port<=r.to&&(r.protocol==='all'||r.protocol===protocol)).sort((a,b)=>a.priority-b.priority)[0];
  return rule?.action==='allow';
}
