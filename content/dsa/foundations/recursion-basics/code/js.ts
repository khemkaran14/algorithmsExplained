function factorial(n){
if(n<=1){
return 1;}
const smaller=factorial(n-1);
return n*smaller;
}
