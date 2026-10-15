#include <cstddef>
class LinkedList {struct Node{int value;Node* next=nullptr;Node* prev=nullptr;};Node *head=nullptr,*tail=nullptr;
public:LinkedList()=default;LinkedList(const LinkedList&)=delete;LinkedList& operator=(const LinkedList&)=delete;
~LinkedList(){while(head)remove(head->value);}
void append(int value){Node* n=new Node{value};n->prev=tail;if(tail)tail->next=n;else head=n;tail=n;}
bool remove(int value){Node *cur=head,*prev=nullptr;if(!cur)return false;do{if(cur->value==value){if(cur==head&&cur==tail)head=tail=nullptr;else{if(prev)prev->next=cur->next;if(cur==head)head=cur->next;if(cur==tail)tail=prev;if(cur->next)cur->next->prev=prev;}delete cur;return true;}prev=cur;cur=cur->next;}while(cur);return false;}
};

