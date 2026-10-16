#include <vector>
#include <map>
#include <climits>
struct Point{int id,x,y;};
std::vector<int> assign(const std::vector<Point>&drivers,const std::vector<Point>&riders){std::map<int,Point>available;for(auto d:drivers)available.emplace(d.id,d);std::vector<int>out;for(auto r:riders){int best=-1,distance=INT_MAX;for(auto [id,d]:available){int score=(d.x-r.x)*(d.x-r.x)+(d.y-r.y)*(d.y-r.y);if(score<distance||(score==distance&&(best==-1||id<best))){best=id;distance=score;}}if(best!=-1)available.erase(best);out.push_back(best);}return out;}
// Full scan is a reference oracle for exact spatial pruning.
// The serial local erase is not a distributed reservation protocol.
