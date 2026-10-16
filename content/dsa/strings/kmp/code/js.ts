function kmp(text,p){const prefix=Array(p.length).fill(0),out=[];
for(let i=1,j=0;i<p.length;){if(p[i]===p[j])prefix[i++]=++j;else if(j)j=prefix[j-1];else prefix[i++]=0;}
for(let i=0,j=0;i<text.length;){if(text[i]===p[j]){i++;j++;if(j===p.length){out.push(i-j);j=prefix[j-1];}}
else if(j)j=prefix[j-1];else i++;}
// A full match falls back instead of resetting away possible overlaps.
return out;}
