// Case-sensitive glob core for already scoped policy statements; deny overrides allow.
function glob(pattern,text) {
  let row=Array(text.length+1).fill(false);row[0]=true;
  for(const token of pattern){const next=Array(text.length+1).fill(false);next[0]=token==='*'&&row[0];
    for(let j=1;j<=text.length;j++)next[j]=token==='*'?(row[j]||next[j-1]):row[j-1]&&(token==='?'||token===text[j-1]);row=next;}
  return row[text.length];
}
function allowed(statements,action,resource,conditionsMatch) {
  let allow=false;
  for(const s of statements)if(glob(s.action,action)&&glob(s.resource,resource)&&conditionsMatch(s)){
    if(s.effect==='deny')return false;allow=true;}
  return allow;
}
