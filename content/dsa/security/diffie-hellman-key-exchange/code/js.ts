// TOY ARITHMETIC ONLY. Tiny public keys/groups provide no real security.
function power(base,e,m){let out=1n;
while(e){if(e&1n)out=out*base%m;e>>=1n;if(e)base=base*base%m;}
return out;}
function agree(a,b){const A=power(5n,BigInt(a),23n),B=power(5n,BigInt(b),23n);
return [power(B,BigInt(a),23n),power(A,BigInt(b),23n)];} // Key agreement alone does not authenticate a peer.
