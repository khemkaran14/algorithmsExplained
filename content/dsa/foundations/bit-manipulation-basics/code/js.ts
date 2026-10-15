function inspect(value,bit){
const mask=1<<bit;
const isSet=Boolean(value&mask),set=value|mask,cleared=value&~mask,toggled=value^mask;
let popcount=0;
for(let x=value;x;x&=x-1)popcount++;
return {isSet,set,cleared,toggled,popcount};}
