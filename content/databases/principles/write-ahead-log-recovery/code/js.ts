function recover(log,durable,disk){disk=structuredClone(disk);const persisted=log.slice(0,durable),winners=new Set(persisted.filter(r=>r.kind==='commit').map(r=>r.tx));
for(const record of persisted)if(record.kind==='update'&&disk[record.key].lsn<record.lsn)disk[record.key]={value:record.after,lsn:record.lsn};
for(const record of [...persisted].reverse())if(record.kind==='update'&&!winners.has(record.tx))disk[record.key]={...record.before};
return disk;}
function flushPage(buffer,disk,key,durable,enforceWAL=true){const page=buffer[key];if(enforceWAL)durable=Math.max(durable,page.lsn);disk[key]={...page};return durable;}
// Updates log before-images and page LSNs; synchronous commit forces the commit record.
// Steal/no-force, one recovery pass, conflicting open writers excluded by locks.
// No checkpoint analysis, compensation log records or repeated-crash ARIES guarantee.
