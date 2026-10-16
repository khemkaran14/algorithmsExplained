import java.util.*;
class Reference {
record Version(int id,String value,boolean marker) {}
static class ObjectVersions {
  final String provider;List<Version> versions=new ArrayList<>();Integer live=null;int serial=0;
  ObjectVersions(String provider){this.provider=provider;}
  int put(String value){Version v=new Version(++serial,value,false);versions.add(v);live=v.id;return v.id;}
  void remove(){if(provider.equals("aws")){Version v=new Version(++serial,null,true);versions.add(v);live=v.id;}else live=null;}
  void removeVersion(int id){boolean wasLive=Objects.equals(live,id);versions.removeIf(v->v.id==id);if(wasLive)live=provider.equals("aws")&&!versions.isEmpty()?versions.get(versions.size()-1).id:null;}
  String get(){return versions.stream().filter(v->Objects.equals(live,v.id)&&!v.marker).map(Version::value).findFirst().orElse(null);}
}
}
