#include <vector>
#include <stdexcept>
class Ring {std::vector<int> a;unsigned head=0,tail=0,size=0;
public:explicit Ring(unsigned capacity):a(capacity){if(!capacity)throw std::invalid_argument("capacity");}
void enqueue(int value){if(size==a.size())throw std::overflow_error("Full");a[tail]=value;tail=(tail+1)%a.size();size++;}
int dequeue(){if(!size)throw std::underflow_error("Empty");int value=a[head];head=(head+1)%a.size();size--;return value;}};
