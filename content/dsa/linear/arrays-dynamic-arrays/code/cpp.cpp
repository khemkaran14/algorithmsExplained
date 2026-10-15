#include <vector>
class DynamicArray {std::vector<int> data=std::vector<int>(1);unsigned length=0;
public:void append(int value){if(length==data.size())data.resize(data.size()*2);
data[length++]=value;}
std::vector<int> values()const{return {data.begin(),data.begin()+length};}
};
