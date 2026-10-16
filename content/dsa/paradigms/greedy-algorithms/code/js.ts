function activities(intervals){const sorted=intervals.map(([start,end],id)=>({start,end,id})).sort((a,b)=>a.end-b.end||a.start-b.start||a.id-b.id),selected=[];let end=0;
for(const item of sorted)if(item.start>=end){selected.push(item.id);end=item.end;}return selected;}
function fractional(items,capacity){const sorted=items.map((item,id)=>({...item,id})).sort((a,b)=>b.value*a.weight-a.value*b.weight||a.id-b.id),taken=[];let value=0;
for(const item of sorted){if(capacity<=0)break;const fraction=Math.min(1,capacity/item.weight);taken.push({id:item.id,fraction});value+=fraction*item.value;capacity=Math.max(0,capacity-fraction*item.weight);}
// Fractional items are divisible. This is not a 0/1-knapsack solution.
return {value,taken};}
