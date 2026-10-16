#include <string>
#include <vector>
#include <algorithm>
#include <functional>
// Decimal addition keeps exact integer results without an external big-integer library.
std::string add(std::string a,std::string b){std::string out;int i=int(a.size())-1,j=int(b.size())-1,carry=0;while(i>=0||j>=0||carry){int sum=carry+(i>=0?a[i--]-'0':0)+(j>=0?b[j--]-'0':0);out+=char('0'+sum%10);carry=sum/10;}std::reverse(out.begin(),out.end());return out;}
std::string fibonacci(int n,bool memo=false){std::vector<std::string>cache(std::max(2,n+1));cache[0]="0";cache[1]="1";std::function<std::string(int)>fib=[&](int i){if(cache[i].empty())cache[i]=add(fib(i-1),fib(i-2));return cache[i];};if(memo)return fib(n);for(int i=2;i<=n;i++)cache[i]=add(cache[i-1],cache[i-2]);return cache[n];}
