import java.util.*;
class Joins {record Customer(int id,String name){}record Order(int id,Integer customerId,int amount){}record Row(Integer customerId,String customerName,Integer orderId,Integer amount){}
static List<Row> join(List<Customer>customers,List<Order>orders,String kind){List<Row>out=new ArrayList<>();Set<Integer>matched=new HashSet<>();
for(Customer c:customers){boolean found=false;for(int i=0;i<orders.size();i++){Order o=orders.get(i);if(o.customerId()!=null&&o.customerId()==c.id()){found=true;matched.add(i);out.add(new Row(c.id(),c.name(),o.id(),o.amount()));}}if(!found&&(kind.equals("left")||kind.equals("full")))out.add(new Row(c.id(),c.name(),null,null));}
if(kind.equals("right")||kind.equals("full"))for(int i=0;i<orders.size();i++)if(!matched.contains(i)){Order o=orders.get(i);out.add(new Row(null,null,o.id(),o.amount()));}
return out;}}
// Nullable fields preserve SQL null extension and one output row per matching pair.
