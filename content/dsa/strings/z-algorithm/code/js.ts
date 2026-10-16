function zMatches(text,p){const s=p+'\0'+text,z=Array(s.length).fill(0),out=[];let left=0,right=-1;
for(let i=1;i<s.length;i++){if(i<=right)z[i]=Math.min(right-i+1,z[i-left]);
while(i+z[i]<s.length&&s[z[i]]===s[i+z[i]])z[i]++;
if(i+z[i]-1>right){left=i;right=i+z[i]-1;}
if(i>p.length&&z[i]>=p.length)out.push(i-p.length-1);}
return out;} // Printable ASCII inputs cannot contain the null separator.
