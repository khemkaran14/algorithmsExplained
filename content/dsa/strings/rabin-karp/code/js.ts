function rabinKarp(text,p){const mod=1000000007,base=257,m=p.length,out=[];if(m>text.length)return out;let high=1,ph=0,wh=0;
for(let i=0;i<m;i++){ph=(ph*base+p.charCodeAt(i))%mod;wh=(wh*base+text.charCodeAt(i))%mod;if(i<m-1)high=high*base%mod;}
for(let start=0;start+m<=text.length;start++){
if(ph===wh&&text.slice(start,start+m)===p)out.push(start);
if(start+m<text.length){wh=((wh-text.charCodeAt(start)*high)%mod+mod)%mod;wh=(wh*base+text.charCodeAt(start+m))%mod;}}
return out;} // Products stay below 2^53 under the bounded ASCII contract.
