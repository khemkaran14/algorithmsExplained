#include <vector>
#include <map>
#include <set>
#include <string>
#include <algorithm>
struct Page{int value,lsn;};struct Log{int lsn;std::string tx,kind,key;Page before;int after;};
std::map<std::string,Page> recover(const std::vector<Log>&log,unsigned durable,std::map<std::string,Page>disk){std::set<std::string>winners;for(unsigned i=0;i<durable;i++)if(log[i].kind=="commit")winners.insert(log[i].tx);for(unsigned i=0;i<durable;i++){auto r=log[i];if(r.kind=="update"&&disk.at(r.key).lsn<r.lsn)disk[r.key]={r.after,r.lsn};}for(unsigned i=durable;i>0;i--){auto r=log[i-1];if(r.kind=="update"&&!winners.count(r.tx))disk[r.key]=r.before;}return disk;}
int flushPage(const std::map<std::string,Page>&buffer,std::map<std::string,Page>&disk,std::string key,int durable,bool enforceWAL=true){auto page=buffer.at(key);if(enforceWAL)durable=std::max(durable,page.lsn);disk[key]=page;return durable;}
// Validated durable prefix and exclusive open writers; unsafe missing WAL defeats undo guarantees.
// This single-pass teaching implementation does not claim full ARIES recovery.
