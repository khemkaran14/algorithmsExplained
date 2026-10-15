#include <cstdint>
std::uint64_t gcd(std::uint64_t a,std::uint64_t b){
while(b){auto remainder=a%b;
a=b;
b=remainder;}
return a;}
