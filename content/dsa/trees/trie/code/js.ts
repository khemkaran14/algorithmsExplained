class Trie {constructor(){this.root={end:false,next:new Map()};}
add(word){let n=this.root;
for(const ch of word){if(!n.next.has(ch))n.next.set(ch,{end:false,next:new Map()});n=n.next.get(ch);}n.end=true;}
has(query,prefix=false){let n=this.root;
for(const ch of query){n=n.next.get(ch);if(!n)return false;}
return prefix||n.end;}}
