function matches(text,pattern){const out=[];
for(let i=0;i+pattern.length<=text.length;i++){let j=0;
while(j<pattern.length&&text[i+j]===pattern[j])j++;
if(j===pattern.length)out.push(i);}
// Pattern is nonempty; one-step alignment keeps overlapping matches.
return out;}
