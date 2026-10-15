#include <list>
#include <unordered_map>
class LFU {struct Entry{unsigned frequency;std::list<int>::iterator position;};unsigned capacity,minimum=0;std::unordered_map<int,Entry> entries;std::unordered_map<unsigned,std::list<int>> buckets;
public:explicit LFU(unsigned capacity):capacity(capacity){}
bool access(int key){auto found=entries.find(key);if(found!=entries.end()){auto f=found->second.frequency;buckets[f].erase(found->second.position);if(buckets[f].empty()){buckets.erase(f);if(minimum==f)minimum++;}auto next=f+1;buckets[next].push_back(key);found->second={next,std::prev(buckets[next].end())};return true;}if(entries.size()==capacity){int victim=buckets[minimum].front();buckets[minimum].pop_front();if(buckets[minimum].empty())buckets.erase(minimum);entries.erase(victim);}minimum=1;buckets[1].push_back(key);entries[key]={1,std::prev(buckets[1].end())};
return false;}};
