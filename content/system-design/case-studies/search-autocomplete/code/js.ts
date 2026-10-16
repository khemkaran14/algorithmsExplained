function suggest(dictionary,prefix,k){const root={children:new Map(),term:null};
for(const term of dictionary){let node=root;for(const ch of term.word){if(!node.children.has(ch))node.children.set(ch,{children:new Map(),term:null});node=node.children.get(ch);}node.term=term;}
let node=root;for(const ch of prefix){node=node.children.get(ch);if(!node)return [];}
const matches=[];function collect(n){if(n.term)matches.push(n.term);for(const child of n.children.values())collect(child);}collect(node);
matches.sort((a,b)=>b.frequency-a.frequency||(a.word<b.word?-1:a.word>b.word?1:0));return matches.slice(0,k);}
// Rank a validated lowercase unique dictionary. Trie lookup alone does not maintain popularity order.
// The player adds prefix-by-prefix typing, outage injection and explicitly stale fallback.
