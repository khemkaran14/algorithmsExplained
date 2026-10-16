#include <bits/stdc++.h>
using namespace std;
struct Sample { long long requests,errors; };
struct Evaluation { long long requests,errors; optional<double> burn; string state; };
Evaluation evaluate(const vector<optional<Sample>>& window,double slo,double threshold,string policy) {
  long long requests=0,errors=0; bool missing=false;
  for(auto s:window) { if(!s) missing=true; else {requests+=s->requests;errors+=s->errors;} }
  optional<double> burn=requests?optional<double>((double)errors/requests/(1-slo/100)):nullopt;
  string state=missing&&policy=="breaching"?"breaching":missing&&policy=="unknown"?"unknown":!burn?"unknown":*burn>=threshold?"breaching":"healthy";
  return {requests,errors,burn,state};
}
