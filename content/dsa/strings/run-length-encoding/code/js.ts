function encode(text){const runs=[];
for(const ch of text){const last=runs.at(-1);
if(last&&last[0]===ch)last[1]++;
else runs.push([ch,1]);}
// Explicit pairs preserve source digits without a delimiter ambiguity.
return runs;}
