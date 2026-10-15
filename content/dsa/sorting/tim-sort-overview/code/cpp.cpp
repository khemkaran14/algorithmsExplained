#include <vector>
#include <algorithm>
std::vector<int> naturalMerge(const std::vector<int>& a){std::vector<std::vector<int>> runs;
for(int start=0;start<(int)a.size();){int end=start+1;bool down=end<(int)a.size()&&a[end]<a[start];while(end<(int)a.size()&&(down?a[end]<a[end-1]:a[end]>=a[end-1]))end++;std::vector<int> run(a.begin()+start,a.begin()+end);if(down)std::reverse(run.begin(),run.end());runs.push_back(run);start=end;}
while(runs.size()>1){std::vector<std::vector<int>> next;for(unsigned i=0;i<runs.size();i+=2){if(i+1==runs.size()){next.push_back(runs[i]);continue;}std::vector<int> out;std::merge(runs[i].begin(),runs[i].end(),runs[i+1].begin(),runs[i+1].end(),std::back_inserter(out));next.push_back(out);}runs=next;}
return runs.empty()?std::vector<int>{}:runs[0];}
