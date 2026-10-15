function primes(n){const composite=Array(n+1).fill(false);composite[0]=composite[1]=true;
for(let p=2;p*p<=n;p++){
if(composite[p])continue;
for(let multiple=p*p;multiple<=n;multiple+=p)composite[multiple]=true;
}
return Array.from({length:n-1},(_,i)=>i+2).filter(i=>!composite[i]);}
