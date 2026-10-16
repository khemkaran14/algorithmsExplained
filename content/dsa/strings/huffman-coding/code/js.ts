class Heap {constructor(){this.a=[];}less(x,y){return x.freq<y.freq||(x.freq===y.freq&&x.id<y.id);}push(x){this.a.push(x);let i=this.a.length-1;while(i>0){let p=Math.floor((i-1)/2);if(!this.less(this.a[i],this.a[p]))break;[this.a[i],this.a[p]]=[this.a[p],this.a[i]];i=p;}}pop(){const out=this.a[0],last=this.a.pop();if(this.a.length){this.a[0]=last;let i=0;while(2*i+1<this.a.length){let c=2*i+1;if(c+1<this.a.length&&this.less(this.a[c+1],this.a[c]))c++;if(!this.less(this.a[c],this.a[i]))break;[this.a[c],this.a[i]]=[this.a[i],this.a[c]];i=c;}}return out;}}
function huffman(text){const freq=new Map(),heap=new Heap(),codes={};let id=0;for(const ch of text)freq.set(ch,(freq.get(ch)||0)+1);
for(const [ch,count]of [...freq].sort(([a],[b])=>a<b?-1:a>b?1:0))heap.push({freq:count,id:id++,ch});
while(heap.a.length>1){const left=heap.pop(),right=heap.pop();heap.push({freq:left.freq+right.freq,id:id++,left,right});}
function visit(n,prefix){if(n.ch!==undefined)codes[n.ch]=prefix||'0';else{visit(n.left,prefix+'0');visit(n.right,prefix+'1');}}visit(heap.pop(),'');
return codes;} // Nonempty input; codebook overhead is separate from encoded payload.
