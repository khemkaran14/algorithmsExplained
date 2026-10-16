import java.util.*;
class Constraints {record Customer(int id,String name){}record Order(int id,Integer customerId,int amount){}
static List<String> check(List<Customer>customers,List<Order>orders){Set<Integer>ids=new HashSet<>(),orderIds=new HashSet<>();List<String>errors=new ArrayList<>();
for(Customer c:customers)if(!ids.add(c.id()))errors.add("duplicate customer");
for(Order o:orders){if(!orderIds.add(o.id()))errors.add("duplicate order");if(o.customerId()!=null&&!ids.contains(o.customerId()))errors.add("orphan customer");}
return errors;}}
// This is a bounded relation check; concurrent persistence requires actual database constraints.
