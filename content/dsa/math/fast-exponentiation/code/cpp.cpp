#include <string>
#include <vector>
#include <algorithm>
// Decimal magnitudes keep the bounded lesson's exact integer result without dependencies.
std::string multiply(const std::string& a,const std::string& b){std::vector<int>d(a.size()+b.size());for(int i=int(a.size())-1;i>=0;--i)for(int j=int(b.size())-1;j>=0;--j)d[i+j+1]+=(a[i]-'0')*(b[j]-'0');for(int i=int(d.size())-1;i>0;--i){d[i-1]+=d[i]/10;d[i]%=10;}std::string s;for(int v:d)if(v||!s.empty())s+=char('0'+v);return s.empty()?"0":s;}
std::string power(int base,unsigned exponent){bool negative=base<0&&(exponent&1);std::string result="1",factor=std::to_string(base<0?-base:base);
while(exponent){if(exponent&1)result=multiply(result,factor);exponent/=2;
if(exponent)factor=multiply(factor,factor);}
return negative&&result!="0"?"-"+result:result;}
