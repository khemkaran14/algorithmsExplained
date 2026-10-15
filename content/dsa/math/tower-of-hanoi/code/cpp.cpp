#include <vector>
#include <utility>
void move(int n,char from,char to,char other,std::vector<std::pair<char,char>>& out){
if(!n)return;move(n-1,from,other,to,out);out.push_back({from,to});move(n-1,other,to,from,out);}
std::vector<std::pair<char,char>> hanoi(int n){std::vector<std::pair<char,char>> out;move(n,'A','C','B',out);
return out;}
