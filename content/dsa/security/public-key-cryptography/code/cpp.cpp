#include <cstdint>
#include <utility>
// TOY ARITHMETIC ONLY; operands are bounded to the lesson's tiny parameters.
uint64_t power(uint64_t base,uint64_t e,uint64_t m){uint64_t out=1;while(e){if(e&1)out=out*base%m;e>>=1;if(e)base=base*base%m;}return out;}
std::pair<uint64_t,uint64_t> roundTrip(uint64_t message){auto encrypted=power(message,17,3233);
return {encrypted,power(encrypted,2753,3233)};}
