import java.util.*;
class Reservoir {static int[] sample(int[] stream,int k,Random random){int[] out=Arrays.copyOf(stream,k);
for(int i=k;i<stream.length;i++){
int j=random.nextInt(i+1);
if(j<k)out[j]=stream[i];}
return out;}}
