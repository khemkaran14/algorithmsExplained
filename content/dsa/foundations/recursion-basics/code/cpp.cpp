long long factorial(int n){
if(n<=1){
return 1;}
long long smaller=factorial(n-1);
return n*smaller;
}
