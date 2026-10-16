function fibonacci(n,memo=false){const cache=new Map([[0,0n],[1,1n]]);
function fib(i){if(cache.has(i))return cache.get(i);
const value=fib(i-1)+fib(i-2);cache.set(i,value);return value;}
if(memo)return fib(n).toString();
for(let i=2;i<=n;i++)cache.set(i,cache.get(i-1)+cache.get(i-2));
return cache.get(n).toString();}
