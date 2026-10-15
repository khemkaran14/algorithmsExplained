#include <vector>
std::vector<int> bubble(std::vector<int> a) { for(int end=(int)a.size()-1;end>0;--end){bool swapped=false;
  for(int j=0;j<end;++j) if(a[j]>a[j+1]) {
    int t=a[j]; a[j]=a[j+1]; a[j+1]=t; swapped=true; }
  if(!swapped) break; }
  return a; }
