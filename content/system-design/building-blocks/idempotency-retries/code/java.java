import java.util.*;
class Idempotency {record Request(String key,int amount,String outcome){}record Answer(List<Request> ledger,List<String> responses){}static Answer apply(List<Request> requests,boolean atomic){Map<String,Integer> saved=new HashMap<>();List<Request>ledger=new ArrayList<>();List<String>responses=new ArrayList<>();
for(Request r:requests){if(saved.containsKey(r.key())){responses.add(saved.get(r.key())==r.amount()?"replayed":"conflict");continue;}if(atomic&&r.outcome().equals("crash-between")){responses.add("rolled-back");continue;}
ledger.add(r);if(r.outcome().equals("crash-between")){responses.add("effect-without-record");continue;}
saved.put(r.key(),r.amount());responses.add(r.outcome().equals("response-lost")?"committed-response-lost":"ok");}
return new Answer(ledger,responses);}}
