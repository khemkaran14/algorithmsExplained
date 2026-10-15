class DynamicArray {
constructor(){this.data=Array(1);this.length=0;}
append(value){if(this.length===this.data.length){const next=Array(this.data.length*2);for(let i=0;i<this.length;i++)next[i]=this.data[i];this.data=next;}
this.data[this.length++]=value;}
values(){return this.data.slice(0,this.length);}
}
