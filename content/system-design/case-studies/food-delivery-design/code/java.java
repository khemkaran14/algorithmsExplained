import java.util.*;
class Saga {static class Order {String fault,reconcile,state="new";boolean reserved,hold,courier,captured;Order(String f,String r){fault=f;reconcile=r;}}int stock,couriers,fulfilled;Saga(int s,int c){stock=s;couriers=c;}
void undo(Order o){if(o.courier){couriers++;o.courier=false;}o.hold=false;if(o.reserved){stock++;o.reserved=false;}o.state="compensated";}
void run(List<Order>orders){for(String stage:List.of("reserve","authorize","assign","capture","reconcile","fulfill"))for(Order o:orders){
if(stage.equals("reserve")&&o.state.equals("new")){if(stock>0){stock--;o.reserved=true;o.state="reserved";}else o.state="rejected";}
if(stage.equals("authorize")&&o.state.equals("reserved")){if(o.fault.equals("authorization"))undo(o);else{o.hold=true;o.state="authorized";}}
if(stage.equals("assign")&&o.state.equals("authorized")){if(couriers==0||o.fault.equals("courier"))undo(o);else{couriers--;o.courier=true;o.state="assigned";}}
if(stage.equals("capture")&&o.state.equals("assigned")){if(o.fault.equals("capture-failed"))undo(o);else if(o.fault.equals("capture-uncertain"))o.state="pending";else{o.captured=true;o.hold=false;o.state="captured";}}
if(stage.equals("reconcile")&&o.state.equals("pending")&&!o.reconcile.equals("unknown")){if(o.reconcile.equals("failed"))undo(o);else{o.captured=true;o.hold=false;o.state="captured";}}
if(stage.equals("fulfill")&&o.state.equals("captured")){o.state="fulfilled";o.reserved=false;fulfilled++;if(o.courier){couriers++;o.courier=false;}}}}}
// Persist state and use repeat-safe remote commands in a real saga coordinator.
