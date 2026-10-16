#include <vector>
#include <map>
#include <set>
#include <string>
#include <algorithm>
struct Post{std::string id;int author,sequence;};
std::vector<Post> feed(const std::vector<Post>&posts,const std::vector<std::pair<int,int>>&followers,int user,std::string mode="hybrid",int threshold=3){std::map<int,std::map<std::string,Post>>inbox;std::set<int>pull;for(auto p:posts){std::set<int>audience{p.author};for(auto [f,a]:followers)if(a==p.author)audience.insert(f);bool hot=int(audience.size())-1>=threshold;if(mode=="pull"||(mode=="hybrid"&&hot))pull.insert(p.author);else for(int reader:audience)inbox[reader].insert_or_assign(p.id,p);}std::set<int>authors{user};for(auto [f,a]:followers)if(f==user)authors.insert(a);auto merged=inbox[user];for(auto p:posts)if(authors.count(p.author)&&pull.count(p.author))merged.insert_or_assign(p.id,p);std::vector<Post>out;for(auto [id,p]:merged)out.push_back(p);std::sort(out.begin(),out.end(),[](auto a,auto b){return a.sequence>b.sequence;});if(out.size()>10)out.resize(10);return out;}
// Fully drained baseline; asynchronous fan-out lag is separately modeled.
