import java.util.*;
class Normalization {record FD(Set<String>left,Set<String>right){}record Report(List<Set<String>>keys,Set<String>prime,boolean second,boolean third,boolean bcnf){}
static Set<String> closure(Set<String>seed,List<FD>fds){Set<String>out=new HashSet<>(seed);boolean changed=true;while(changed){changed=false;for(FD fd:fds)if(out.containsAll(fd.left()))if(out.addAll(fd.right()))changed=true;}return out;}
static Report analyze(List<String>attrs,List<FD>fds){List<Set<String>>keys=new ArrayList<>();for(int mask=0;mask<(1<<attrs.size());mask++){Set<String>subset=new HashSet<>();for(int i=0;i<attrs.size();i++)if((mask&(1<<i))!=0)subset.add(attrs.get(i));if(closure(subset,fds).containsAll(attrs)&&keys.stream().noneMatch(subset::containsAll))keys.add(subset);}Set<String>prime=new HashSet<>();for(var k:keys)prime.addAll(k);boolean second=true,third=true,bcnf=true;
for(FD fd:fds)if(!closure(fd.left(),fds).containsAll(attrs))for(String a:fd.right())if(!fd.left().contains(a)){bcnf=false;if(!prime.contains(a))third=false;}
for(var key:keys){List<String>list=new ArrayList<>(key);for(int mask=0;mask<(1<<list.size())-1;mask++){Set<String>subset=new HashSet<>();for(int i=0;i<list.size();i++)if((mask&(1<<i))!=0)subset.add(list.get(i));for(String a:closure(subset,fds))if(!prime.contains(a))second=false;}}
return new Report(keys,prime,second,second&&third,bcnf);}}
// Atomic cells are assumed. The player adds a first lossless BCNF split and assumption controls.
