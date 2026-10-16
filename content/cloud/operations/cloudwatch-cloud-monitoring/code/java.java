import java.util.*;
class Reference {
record Sample(long requests,long errors) {}
record Evaluation(long requests,long errors,Double burn,String state) {}
static Evaluation evaluate(List<Sample> window,double slo,double threshold,String policy) {
  long requests=0,errors=0; boolean missing=false;
  for(Sample s:window) { if(s==null) missing=true; else {requests+=s.requests;errors+=s.errors;} }
  Double burn=requests==0?null:((double)errors/requests)/(1-slo/100);
  String state=missing&&policy.equals("breaching")?"breaching":missing&&policy.equals("unknown")?"unknown":burn==null?"unknown":burn>=threshold?"breaching":"healthy";
  return new Evaluation(requests,errors,burn,state);
}
}
