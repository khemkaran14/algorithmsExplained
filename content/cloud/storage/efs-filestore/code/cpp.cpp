#include <bits/stdc++.h>
using namespace std;
struct Snapshot { string value;int epoch; };
struct SharedFile {
  string value;int epoch=0;optional<string> lock;
  bool acquire(string client){if(lock&&*lock!=client)return false;lock=client;return true;}
  Snapshot read()const{return {value,epoch};}
  bool write(string client,Snapshot remembered,string suffix,string mode){
    if(mode=="lock"&&(!lock||*lock!=client))return false;
    if(mode=="cas"&&remembered.epoch!=epoch)return false;
    value=(mode=="lock"?value:remembered.value)+suffix;epoch++;return true;
  }
  void confirmedCrash(string client){if(lock&&*lock==client)lock.reset();}
};
