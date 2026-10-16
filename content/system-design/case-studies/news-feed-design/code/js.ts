function feed(posts,followers,user,mode='hybrid',threshold=3){const inbox=new Map(),pull=new Set();
for(const post of posts){const audience=[post.author,...followers.filter(([f,a])=>a===post.author).map(([f])=>f)];const hot=audience.length-1>=threshold;
if(mode==='pull'||(mode==='hybrid'&&hot))pull.add(post.author);else for(const reader of new Set(audience)){if(!inbox.has(reader))inbox.set(reader,new Map());inbox.get(reader).set(post.id,post);}}
const authors=new Set([user,...followers.filter(([f])=>f===user).map(([,a])=>a)]),merged=new Map(inbox.get(user)||[]);
for(const post of posts)if(authors.has(post.author)&&pull.has(post.author))merged.set(post.id,post);
return [...merged.values()].sort((a,b)=>b.sequence-a.sequence).slice(0,10);}
// Core fully drained materialization round. The player uses a bounded worker budget to expose lag.
// Inputs have unique immutable post IDs and distinct non-self follower pairs.
