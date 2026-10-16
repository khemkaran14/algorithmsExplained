#include <bits/stdc++.h>
using namespace std;
struct Volume {
  string zone;optional<string> owner;map<int,string> disk,dirty;
  explicit Volume(string z):zone(z){}
  bool attach(string vm,string z){if(z!=zone||(owner&&*owner!=vm))return false;owner=vm;return true;}
  bool write(string vm,int block,string value){if(!owner||*owner!=vm)return false;dirty[block]=value;return true;}
  bool flush(string vm){if(!owner||*owner!=vm)return false;for(auto [b,v]:dirty)disk[b]=v;dirty.clear();return true;}
  int crash(string vm){if(!owner||*owner!=vm)return 0;int lost=dirty.size();dirty.clear();owner.reset();return lost;}
  map<int,string> snapshot()const{return disk;}
};
