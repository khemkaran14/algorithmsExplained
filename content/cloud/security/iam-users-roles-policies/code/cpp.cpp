#include <bits/stdc++.h>
using namespace std;
bool glob(const string& pattern,const string& text){
  vector<bool> row(text.size()+1);row[0]=true;
  for(char token:pattern){vector<bool> next(row.size());next[0]=token=='*'&&row[0];
    for(size_t j=1;j<row.size();j++)next[j]=token=='*'?(row[j]||next[j-1]):row[j-1]&&(token=='?'||token==text[j-1]);row=next;}
  return row.back();
}
struct Statement { string action,resource,effect;bool conditionsMatch; };
bool allowed(const vector<Statement>& statements,string action,string resource){
  bool allow=false;for(auto s:statements)if(glob(s.action,action)&&glob(s.resource,resource)&&s.conditionsMatch){if(s.effect=="deny")return false;allow=true;}return allow;
}
