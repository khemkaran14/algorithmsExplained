#include <string>
#include <vector>
std::vector<int> kmp(const std::string& text,const std::string& p){std::vector<int>prefix(p.size()),out;for(unsigned i=1,j=0;i<p.size();){if(p[i]==p[j])prefix[i++]=++j;else if(j)j=prefix[j-1];else prefix[i++]=0;}
for(unsigned i=0,j=0;i<text.size();){if(text[i]==p[j]){i++;j++;if(j==p.size()){out.push_back(i-j);j=prefix[j-1];}}else if(j)j=prefix[j-1];else i++;}
// Callers must provide a nonempty pattern.
return out;}
