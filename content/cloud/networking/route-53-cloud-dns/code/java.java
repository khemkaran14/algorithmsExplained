import java.util.*;
class Reference {
record Record(String address,boolean healthy) {}record Answer(List<String> addresses,String status,Integer expires,String source) {}
static class Resolver {
  Answer cache;
  Answer resolve(int tick,List<Record> records,int ttl,int negativeTTL){
    if(cache!=null&&tick<cache.expires)return new Answer(cache.addresses,cache.status,cache.expires,"cache");
    if(records.isEmpty())cache=new Answer(List.of(),"NXDOMAIN",tick+negativeTTL,"authority");
    else {List<String> answers=records.stream().filter(Record::healthy).map(Record::address).toList();
      if(answers.isEmpty())return new Answer(List.of(),"no-healthy-answer",null,"authority");
      cache=new Answer(answers,"answer",tick+ttl,"authority");}
    return cache;
  }
}
}
