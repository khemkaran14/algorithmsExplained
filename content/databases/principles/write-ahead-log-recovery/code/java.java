import java.util.*;
class Recovery {record Page(int value,int lsn){}record Log(int lsn,String tx,String kind,String key,Page before,Integer after){}
static Map<String,Page> recover(List<Log>log,int durable,Map<String,Page>disk){Map<String,Page>out=new HashMap<>(disk);List<Log>persisted=log.subList(0,durable);Set<String>winners=new HashSet<>();for(Log r:persisted)if(r.kind().equals("commit"))winners.add(r.tx());
for(Log r:persisted)if(r.kind().equals("update")&&out.get(r.key()).lsn()<r.lsn())out.put(r.key(),new Page(r.after(),r.lsn()));
for(int i=persisted.size()-1;i>=0;i--){Log r=persisted.get(i);if(r.kind().equals("update")&&!winners.contains(r.tx()))out.put(r.key(),r.before());}return out;}
static int flushPage(Map<String,Page>buffer,Map<String,Page>disk,String key,int durable,boolean enforceWAL){Page page=buffer.get(key);if(enforceWAL)durable=Math.max(durable,page.lsn());disk.put(key,page);return durable;}}
// The player creates/forces records and simulates crash loss; recovery here assumes one durable prefix.
// Full ARIES additionally needs analysis, checkpoints, CLRs and repeated-crash handling.
