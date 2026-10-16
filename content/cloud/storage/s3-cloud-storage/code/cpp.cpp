#include <bits/stdc++.h>
using namespace std;
struct Version { int id;string value;bool marker; };
struct ObjectVersions {
  string provider;vector<Version> versions;optional<int> live;int serial=0;
  explicit ObjectVersions(string p):provider(p){}
  int put(string value){versions.push_back({++serial,value,false});live=serial;return serial;}
  void remove(){if(provider=="aws"){versions.push_back({++serial,"",true});live=serial;}else live.reset();}
  void removeVersion(int id){bool wasLive=live&&*live==id;versions.erase(remove_if(versions.begin(),versions.end(),[&](auto v){return v.id==id;}),versions.end());if(wasLive){live.reset();if(provider=="aws"&&!versions.empty())live=versions.back().id;}}
  optional<string> get()const{for(auto v:versions)if(live&&*live==v.id&&!v.marker)return v.value;return nullopt;}
};
