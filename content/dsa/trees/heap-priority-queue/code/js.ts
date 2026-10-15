class MaxHeap {constructor(a=[]){this.a=[...a];for(let i=Math.floor(a.length/2)-1;i>=0;i--)this.sink(i);}
sink(i){const a=this.a;while(2*i+1<a.length){let c=2*i+1;if(c+1<a.length&&a[c+1]>a[c])c++;if(a[i]>=a[c])break;[a[i],a[c]]=[a[c],a[i]];i=c;}}
push(k){const a=this.a;a.push(k);let i=a.length-1;while(i>0){const p=Math.floor((i-1)/2);if(a[p]>=a[i])break;[a[p],a[i]]=[a[i],a[p]];i=p;}}
pop(){if(!this.a.length)throw Error('empty');const out=this.a[0],last=this.a.pop();if(this.a.length){this.a[0]=last;this.sink(0);}return out;}
peek(){return this.a[0];}
}
