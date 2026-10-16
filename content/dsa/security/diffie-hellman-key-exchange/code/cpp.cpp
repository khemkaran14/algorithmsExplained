#include <cstdint>
#include <utility>
// TOY ARITHMETIC ONLY; operands are bounded to the lesson's tiny parameters.
uint64_t power(uint64_t base,uint64_t e,uint64_t m){uint64_t out=1;while(e){if(e&1)out=out*base%m;e>>=1;if(e)base=base*base%m;}return out;}
std::pair<uint64_t,uint64_t> agree(uint64_t a,uint64_t b){auto A=power(5,a,23),B=power(5,b,23);
return {power(B,a,23),power(A,b,23)};}
