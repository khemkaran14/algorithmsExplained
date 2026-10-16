function hash32(s){let x=2166136261;for(const ch of s)x=Math.imul(x^ch.charCodeAt(0),16777619)>>>0;x=Math.imul(x^(x>>>16),0x85ebca6b);x=Math.imul(x^(x>>>13),0xc2b2ae35);return (x^(x>>>16))>>>0;}
function owners(nodes,keys,strategy='consistent',replicas=4){const ring=nodes.flatMap(node=>Array.from({length:replicas},(_,r)=>({node,hash:hash32(`node:${node}:${r}`)}))).sort((a,b)=>a.hash-b.hash||a.node-b.node);
return keys.map(key=>{if(strategy==='modulo')return nodes[key%nodes.length];if(strategy==='range')return nodes[Math.min(nodes.length-1,Math.floor(key/1000*nodes.length))];
const hash=hash32(`key:${key}`);let lo=0,hi=ring.length;while(lo<hi){const mid=lo+Math.floor((hi-lo)/2);if(ring[mid].hash>=hash)hi=mid;else lo=mid+1;}
return ring[lo%ring.length].node;});}
// Compare owners(nodes,keys,...) with owners([...nodes,newNode],keys,...); keys are integers 0..999.
