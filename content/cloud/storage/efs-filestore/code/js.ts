// Application compare-and-set around an abstract file, not native NFS atomic append.
class SharedFile {
  constructor(){this.value='';this.epoch=0;this.lock=null;}
  acquire(client){if(this.lock!==null&&this.lock!==client)return false;this.lock=client;return true;}
  read(){return {value:this.value,epoch:this.epoch};}
  write(client,remembered,suffix,mode){
    if(mode==='lock'&&this.lock!==client)return false;
    if(mode==='cas'&&remembered.epoch!==this.epoch)return false;
    this.value=(mode==='lock'?this.value:remembered.value)+suffix;this.epoch++;return true;
  }
  confirmedCrash(client){if(this.lock===client)this.lock=null;}
}
