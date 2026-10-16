function crawl(pages,seeds,robots={},delay=2,workers=2,ticks=12){const canonical=s=>{const u=new URL(s);u.hash='';return u.href;},graph=new Map(pages.map(p=>[canonical(p.url),p.links]));
const seen=new Set(seeds.map(canonical)),frontier=[...seen],nextHost=new Map(),history=[];
for(let tick=0;tick<ticks;tick++){let budget=workers;while(budget){const i=frontier.findIndex(s=>(nextHost.get(new URL(s).hostname)||0)<=tick);if(i<0)break;const url=frontier.splice(i,1)[0],u=new URL(url);
if((robots[u.hostname]||[]).some(prefix=>u.pathname.startsWith(prefix))){history.push({tick,url,status:'blocked'});continue;}
budget--;nextHost.set(u.hostname,tick+delay);const links=graph.get(url);history.push({tick,url,status:links?'visited':'missing'});if(links)for(const raw of links){const value=canonical(raw);if(!seen.has(value)){seen.add(value);frontier.push(value);}}}}
return {history,pending:frontier,discovered:seen.size};}
// Only the supplied graph is visited. Prefix policies deliberately omit the full robots grammar.
