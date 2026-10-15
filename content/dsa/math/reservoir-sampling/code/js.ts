function reservoir(stream,k,randomInt){const sample=stream.slice(0,k);
for(let i=k;i<stream.length;i++){
const j=randomInt(i+1); // Uniform in [0,i], using a caller-supplied random source.
if(j<k){
sample[j]=stream[i];}}
return sample;}
