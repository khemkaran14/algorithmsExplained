long long fibonacci(int n){
if(n<2)return n;
long long left=fibonacci(n-1);
long long right=fibonacci(n-2);
return left+right;
}
