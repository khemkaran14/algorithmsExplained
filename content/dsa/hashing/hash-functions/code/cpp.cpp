#include <string>
int hashKey(const std::string& text,int m){int h=0;
for(unsigned char ch:text){
h=(31*h+ch)%m;}
// Printable ASCII input; equality is checked separately.
return h;}
