function codePoints(text){
const out=[];
for(const point of text){
out.push(point.codePointAt(0));
}
return out;}
