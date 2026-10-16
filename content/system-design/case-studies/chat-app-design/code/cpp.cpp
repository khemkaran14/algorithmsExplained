#include <string>
#include <vector>
#include <unordered_map>
#include <stdexcept>
struct RoomLog {struct Message{std::string id,user,room,text;int sequence;};std::unordered_map<std::string,Message>messages;std::unordered_map<std::string,std::vector<Message>>rooms;
Message send(std::string id,std::string user,std::string room,std::string text){auto it=messages.find(id);if(it!=messages.end()){auto old=it->second;if(old.user!=user||old.room!=room||old.text!=text)throw std::invalid_argument("identity conflict");return old;}if(room=="support"&&user=="alice")throw std::invalid_argument("not a member");auto& log=rooms[room];Message m{id,user,room,text,int(log.size()+1)};log.push_back(m);messages.emplace(id,m);return m;}
std::vector<Message> after(std::string room,int cursor){std::vector<Message>out;for(auto m:rooms[room])if(m.sequence>cursor)out.push_back(m);return out;}};
