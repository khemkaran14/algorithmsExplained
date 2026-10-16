function saga(orders,stock,couriers){const rows=orders.map(o=>({...o,state:'new',reserved:false,hold:false,courier:false,captured:false}));let fulfilled=0;
function undo(o){if(o.courier){couriers++;o.courier=false;}o.hold=false;if(o.reserved){stock++;o.reserved=false;}o.state='compensated';}
for(const stage of ['reserve','authorize','assign','capture','reconcile','fulfill'])for(const o of rows){
if(stage==='reserve'&&o.state==='new'){if(stock){stock--;o.reserved=true;o.state='reserved';}else o.state='rejected';}
if(stage==='authorize'&&o.state==='reserved'){if(o.fault==='authorization')undo(o);else{o.hold=true;o.state='authorized';}}
if(stage==='assign'&&o.state==='authorized'){if(!couriers||o.fault==='courier')undo(o);else{couriers--;o.courier=true;o.state='assigned';}}
if(stage==='capture'&&o.state==='assigned'){if(o.fault==='capture-failed')undo(o);else if(o.fault==='capture-uncertain')o.state='pending';else{o.captured=true;o.hold=false;o.state='captured';}}
if(stage==='reconcile'&&o.state==='pending'&&o.reconcile!=='unknown'){if(o.reconcile==='failed')undo(o);else{o.captured=true;o.hold=false;o.state='captured';}}
if(stage==='fulfill'&&o.state==='captured'){o.state='fulfilled';o.reserved=false;fulfilled++;if(o.courier){couriers++;o.courier=false;}}}
return {rows,stock,couriers,fulfilled};} // Reliable local compensation is an explicit teaching assumption.
