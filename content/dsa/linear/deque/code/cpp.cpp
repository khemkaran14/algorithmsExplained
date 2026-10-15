#include <deque>
#include <stdexcept>
class Deque {std::deque<int> values;
public:void pushFront(int value){values.push_front(value);}void pushBack(int value){values.push_back(value);}
int popFront(){if(values.empty())throw std::underflow_error("Empty");int value=values.front();values.pop_front();return value;}
int popBack(){if(values.empty())throw std::underflow_error("Empty");int value=values.back();values.pop_back();return value;}};
