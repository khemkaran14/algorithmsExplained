function fibonacci(n){
if(n<2)return n;
const left=fibonacci(n-1);
const right=fibonacci(n-2);
return left+right;
}
