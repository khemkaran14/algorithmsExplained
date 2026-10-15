#include <queue>
#include <stdexcept>
class Queue {std::queue<int> values;
public:void enqueue(int value){values.push(value);}
int dequeue(){if(values.empty())throw std::underflow_error("Empty");int value=values.front();values.pop();return value;}
bool isEmpty()const{return values.empty();}};
