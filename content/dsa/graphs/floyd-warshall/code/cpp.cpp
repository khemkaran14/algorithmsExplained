#include <vector>
#include <array>
#include <limits>
#include <algorithm>
#include <cmath>
std::vector<std::vector<double>> floyd(int n,const std::vector<std::array<int,3>>& edges,bool directed=true){double inf=std::numeric_limits<double>::infinity();std::vector<std::vector<double>>d(n,std::vector<double>(n,inf));for(int i=0;i<n;i++)d[i][i]=0;for(auto [u,v,w]:edges){d[u][v]=std::min(d[u][v],double(w));if(!directed)d[v][u]=std::min(d[v][u],double(w));}for(int k=0;k<n;k++)for(int i=0;i<n;i++)for(int j=0;j<n;j++)d[i][j]=std::min(d[i][j],d[i][k]+d[k][j]);auto out=d;for(int k=0;k<n;k++)if(d[k][k]<0)for(int i=0;i<n;i++)for(int j=0;j<n;j++)if(std::isfinite(d[i][k])&&std::isfinite(d[k][j]))out[i][j]=-inf;return out;}
