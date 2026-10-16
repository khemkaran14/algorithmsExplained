// TOY ARITHMETIC ONLY. Tiny public keys/groups provide no real security.
function power(base,e,m){let out=1n;
while(e){if(e&1n)out=out*base%m;e>>=1n;if(e)base=base*base%m;}
return out;}
function roundTrip(message){const encrypted=power(BigInt(message),17n,3233n);
return {encrypted,decrypted:power(encrypted,2753n,3233n)};} // Real RSA encryption requires large keys and randomized OAEP padding.
