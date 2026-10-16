function assign(drivers,riders){const available=new Map(drivers.map(d=>[d.id,{...d}])),out=[];
for(const rider of riders){let best=null,distance=Infinity;for(const d of available.values()){const score=(d.x-rider.x)**2+(d.y-rider.y)**2;if(score<distance||(score===distance&&d.id<best)){best=d.id;distance=score;}}
if(best!==null)available.delete(best);out.push({driver:best,distance:best===null?null:Math.sqrt(distance)});}
return out;}
// Full scan is an independent baseline for the visualizer's lower-bound spatial pruning.
// The local delete serializes reservations. A shared backend needs atomic compare-and-set and retries.
// Euclidean nearest is neither global optimal matching nor a real road ETA.
