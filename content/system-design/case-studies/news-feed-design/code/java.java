import java.util.*;
class Feed {record Post(String id,int author,int sequence){}static List<Post> feed(List<Post>posts,int[][]followers,int user,String mode,int threshold){Map<Integer,Map<String,Post>>inbox=new HashMap<>();Set<Integer>pull=new HashSet<>();
for(Post p:posts){Set<Integer>audience=new HashSet<>();audience.add(p.author());for(int[] f:followers)if(f[1]==p.author())audience.add(f[0]);boolean hot=audience.size()-1>=threshold;if(mode.equals("pull")||(mode.equals("hybrid")&&hot))pull.add(p.author());else for(int reader:audience)inbox.computeIfAbsent(reader,k->new HashMap<>()).put(p.id(),p);}
Set<Integer>authors=new HashSet<>();authors.add(user);for(int[] f:followers)if(f[0]==user)authors.add(f[1]);Map<String,Post>merged=new HashMap<>(inbox.getOrDefault(user,Map.of()));for(Post p:posts)if(authors.contains(p.author())&&pull.contains(p.author()))merged.put(p.id(),p);
return merged.values().stream().sorted(Comparator.comparingInt(Post::sequence).reversed()).limit(10).toList();}}
// Fully drained fan-out baseline with identity-based merge.
// Bounded worker lag and outages are additional player state.
