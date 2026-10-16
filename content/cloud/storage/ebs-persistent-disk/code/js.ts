// One zonal block-volume attachment and dirty-buffer durability boundary.
class Volume {
  constructor(zone){this.zone=zone;this.owner=null;this.disk=new Map();this.dirty=new Map();}
  attach(vm,zone){if(zone!==this.zone||(this.owner!==null&&this.owner!==vm))return false;this.owner=vm;return true;}
  write(vm,block,value){if(this.owner!==vm)return false;this.dirty.set(block,value);return true;}
  flush(vm){if(this.owner!==vm)return false;for(const [b,v]of this.dirty)this.disk.set(b,v);this.dirty.clear();return true;}
  crash(vm){if(this.owner!==vm)return 0;const lost=this.dirty.size;this.dirty.clear();this.owner=null;return lost;}
  snapshot(){return new Map(this.disk);}
}
