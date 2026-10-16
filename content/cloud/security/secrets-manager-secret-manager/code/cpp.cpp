#include <bits/stdc++.h>
using namespace std;
struct Rotation {
  int active=1,next=1;optional<int> pending;bool validated=false;set<int> accepted{1};
  bool create(){if(pending)return false;pending=++next;validated=false;return true;}
  bool configure(bool success){validated=false;if(!pending||!success)return false;accepted.insert(*pending);return true;}
  bool validate(bool success){validated=pending&&accepted.count(*pending)&&success;return validated;}
  bool promote(){if(!pending||!validated||!accepted.count(*pending))return false;active=*pending;pending.reset();validated=false;return true;}
  bool retire(){if(pending)return false;accepted={active};return true;}
  bool authenticate(int cachedVersion)const{return accepted.count(cachedVersion);}
};
