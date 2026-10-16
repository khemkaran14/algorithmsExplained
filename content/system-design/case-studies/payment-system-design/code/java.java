import java.util.*;
class Payments {record Event(String id,String kind,int amount,String currency){}record Entry(String account,int delta){}record Result(String state,int captured,int refunded,boolean entitled,List<Entry>ledger){}
static Result apply(List<Event>events,int price,String currency){Map<String,Event>seen=new HashMap<>();List<Entry>ledger=new ArrayList<>();int captured=0,refunded=0;String state="created";
for(Event e:events){Event prior=seen.get(e.id());if(prior!=null){if(!prior.equals(e))throw new IllegalArgumentException("event-conflict");continue;}if(!e.currency().equals(currency))continue;
if(e.kind().equals("capture")){if(e.amount()!=price)continue;if(captured==0){captured=e.amount();state="captured";ledger.add(new Entry("provider",captured));ledger.add(new Entry("liability",-captured));}}
else if(e.kind().equals("refund")){if(captured==0||e.amount()>captured-refunded)continue;refunded+=e.amount();state=refunded==captured?"refunded":"partially-refunded";ledger.add(new Entry("provider",-e.amount()));ledger.add(new Entry("liability",e.amount()));}else if(captured==0)state="failed";seen.put(e.id(),e);}
return new Result(state,captured,refunded,captured>0&&refunded==0,ledger);}}
// Trusted, positive minor-unit event inputs; local atomic transition core, no provider calls.
