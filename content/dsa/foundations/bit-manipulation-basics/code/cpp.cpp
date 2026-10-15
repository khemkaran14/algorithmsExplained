#include <array>
#include <cstdint>
std::array<std::uint32_t,5> inspect(std::uint32_t value,unsigned bit){
const std::uint32_t mask=std::uint32_t{1}<<bit;unsigned count=0;
for(auto x=value;x;x&=x-1)count++;
return {bool(value&mask),value|mask,value&~mask,value^mask,count};}
