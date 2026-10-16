// Diff after optional refresh; caller validates names are unique.
function plan(observed,desired) {
  const old=new Map(observed.map(x=>[x.name,x])),next=new Map(desired.map(x=>[x.name,x]));
  const actions=observed.filter(x=>!next.has(x.name)).map(x=>({name:x.name,kind:'destroy',value:x}));
  for(const value of desired){const before=old.get(value.name);
    const kind=!before?'create':before.region!==value.region?'replace':before.size!==value.size?'update':null;
    if(kind)actions.push({name:value.name,kind,value});
  }
  return actions;
}
function blocked(actions,preventDestroy){return preventDestroy&&actions.some(x=>x.kind==='replace'||x.kind==='destroy');}
