import java.util.*;
class Denormalization {static class Order{int id,customerId;String address;Order(int id,int customerId,String address){this.id=id;this.customerId=customerId;this.address=address;}}record Outcome(boolean committed,int copies){}record Read(String address,boolean stale){}
static Outcome update(Map<Integer,String>profile,List<Order>orders,int id,String address,boolean atomic,int failAfter){List<Order>targets=orders.stream().filter(o->o.customerId==id).toList();boolean fails=failAfter>=0&&failAfter<targets.size();if(atomic&&fails)return new Outcome(false,0);profile.put(id,address);int copies=0;for(Order row:targets){if(fails&&copies>=failAfter)break;row.address=address;copies++;}return new Outcome(!fails,copies);}
static Read read(Map<Integer,String>profile,Order order,boolean normalized){String truth=profile.get(order.customerId),address=normalized?truth:order.address;return new Read(address,!Objects.equals(address,truth));}
static void repair(Map<Integer,String>profile,List<Order>orders){for(Order row:orders)row.address=profile.get(row.customerId);}}
// Atomic behavior here preflights a deterministic injected failure; real persistence uses a transaction.
// Asynchronous outbox maintenance is a separate player mode.
