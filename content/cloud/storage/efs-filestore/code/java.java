import java.util.*;
class Reference {
record Snapshot(String value,int epoch) {}
static class SharedFile {
  String value="",lock=null;int epoch=0;
  boolean acquire(String client){if(lock!=null&&!lock.equals(client))return false;lock=client;return true;}
  Snapshot read(){return new Snapshot(value,epoch);}
  boolean write(String client,Snapshot remembered,String suffix,String mode){
    if(mode.equals("lock")&&!Objects.equals(lock,client))return false;
    if(mode.equals("cas")&&remembered.epoch!=epoch)return false;
    value=(mode.equals("lock")?value:remembered.value)+suffix;epoch++;return true;
  }
  void confirmedCrash(String client){if(Objects.equals(lock,client))lock=null;}
}
}
