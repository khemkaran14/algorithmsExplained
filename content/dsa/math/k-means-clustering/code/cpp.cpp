#include <vector>
#include <array>
#include <limits>
std::vector<int> kmeans(const std::vector<std::array<double,2>>& points,std::vector<std::array<double,2>>& centers,int iterations){std::vector<int> groups(points.size(),-1);for(int step=0;step<iterations;step++){bool changed=false;for(unsigned i=0;i<points.size();i++){int best=0;double distance=std::numeric_limits<double>::infinity();for(unsigned c=0;c<centers.size();c++){double x=points[i][0]-centers[c][0],y=points[i][1]-centers[c][1],d=x*x+y*y;if(d<distance){distance=d;best=c;}}changed|=groups[i]!=best;groups[i]=best;}
for(unsigned c=0;c<centers.size();c++){double x=0,y=0;unsigned count=0;for(unsigned i=0;i<points.size();i++)if(groups[i]==(int)c){x+=points[i][0];y+=points[i][1];count++;}if(count)centers[c]={x/count,y/count};}if(!changed)break;}
return groups;}
