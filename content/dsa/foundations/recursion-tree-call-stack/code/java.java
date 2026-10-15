class Fibonacci {
static long fibonacci(int n){if(n<2)return n;
long left=fibonacci(n-1);
long right=fibonacci(n-2);
return left+right;
}}
