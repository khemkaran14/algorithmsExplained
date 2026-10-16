#include <string>
#include <vector>
struct Order{std::string fault,reconcile,state="new";bool reserved=false,hold=false,courier=false,captured=false;};
struct Saga{int stock,couriers,fulfilled=0;void undo(Order& o){if(o.courier){couriers++;o.courier=false;}o.hold=false;if(o.reserved){stock++;o.reserved=false;}o.state="compensated";}
void run(std::vector<Order>&orders){for(std::string stage:{"reserve","authorize","assign","capture","reconcile","fulfill"})for(auto& o:orders){
if(stage=="reserve"&&o.state=="new"){if(stock>0){stock--;o.reserved=true;o.state="reserved";}else o.state="rejected";}
if(stage=="authorize"&&o.state=="reserved"){if(o.fault=="authorization")undo(o);else{o.hold=true;o.state="authorized";}}
if(stage=="assign"&&o.state=="authorized"){if(!couriers||o.fault=="courier")undo(o);else{couriers--;o.courier=true;o.state="assigned";}}
if(stage=="capture"&&o.state=="assigned"){if(o.fault=="capture-failed")undo(o);else if(o.fault=="capture-uncertain")o.state="pending";else{o.captured=true;o.hold=false;o.state="captured";}}
if(stage=="reconcile"&&o.state=="pending"&&o.reconcile!="unknown"){if(o.reconcile=="failed")undo(o);else{o.captured=true;o.hold=false;o.state="captured";}}
if(stage=="fulfill"&&o.state=="captured"){o.state="fulfilled";o.reserved=false;fulfilled++;if(o.courier){couriers++;o.courier=false;}}}}};
// This bounded model assumes reliable compensation and no real provider calls.
