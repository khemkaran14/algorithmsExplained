import java.util.*;
class Reference {
static class Volume {
  final String zone;String owner;Map<Integer,String> disk=new HashMap<>(),dirty=new HashMap<>();
  Volume(String zone){this.zone=zone;}
  boolean attach(String vm,String zone){if(!this.zone.equals(zone)||(owner!=null&&!owner.equals(vm)))return false;owner=vm;return true;}
  boolean write(String vm,int block,String value){if(!Objects.equals(owner,vm))return false;dirty.put(block,value);return true;}
  boolean flush(String vm){if(!Objects.equals(owner,vm))return false;disk.putAll(dirty);dirty.clear();return true;}
  int crash(String vm){if(!Objects.equals(owner,vm))return 0;int lost=dirty.size();dirty.clear();owner=null;return lost;}
  Map<Integer,String> snapshot(){return new HashMap<>(disk);}
}
}
