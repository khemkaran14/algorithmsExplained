class Bits {
static int[] inspect(int value,int bit){
int mask=1<<bit;
int isSet=(value&mask)!=0?1:0;
int count=Integer.bitCount(value);
return new int[]{isSet,value|mask,value&~mask,value^mask,count};}}
