function hash(text,m){let h=0;
for(const ch of text){
h=(31*h+ch.charCodeAt(0))%m;
}
// Equality must still be checked after hashing.
return h;}
