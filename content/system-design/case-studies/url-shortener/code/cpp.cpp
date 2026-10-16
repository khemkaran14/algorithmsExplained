#include <string>
#include <unordered_map>
#include <stdexcept>
struct Links {unsigned long long next=1;struct Link{std::string url;bool active;};std::unordered_map<std::string,Link>links;std::unordered_map<std::string,std::pair<std::string,std::string>>keys;
std::string create(const std::string& key,const std::string& url){auto it=keys.find(key);if(it!=keys.end()){if(it->second.first!=url)throw std::invalid_argument("key conflict");return it->second.second;}std::string alphabet="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",code;auto n=next++;do{code=alphabet[n%62]+code;n/=62;}while(n);while(code.size()<3)code="0"+code;if(links.count(code))throw std::runtime_error("unique constraint");links.emplace(code,Link{url,true});keys[key]={url,code};return code;}
std::string resolve(const std::string& code){auto it=links.find(code);return it!=links.end()&&it->second.active?it->second.url:"";}
void revoke(const std::string& code){auto it=links.find(code);if(it!=links.end())it->second.active=false;}};
