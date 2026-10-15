import java.util.function.IntFunction;
class Bloom {final boolean[] bits;final IntFunction<int[]> positions;Bloom(int m,IntFunction<int[]> positions){bits=new boolean[m];this.positions=positions;}
void add(int key){for(int i:positions.apply(key))bits[i]=true;}
boolean maybe(int key){for(int i:positions.apply(key)){
if(!bits[i])return false;}
return true;}} // The supplied stable hashes must return indices within the bit array.
