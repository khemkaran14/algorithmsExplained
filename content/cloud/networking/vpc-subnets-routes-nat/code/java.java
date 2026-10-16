import java.util.*;
class Reference {
static long ip(String value){long n=0;for(String part:value.split("\\."))n=n*256+Integer.parseInt(part);return n;}
static int prefix(String cidr){return Integer.parseInt(cidr.split("/")[1]);}
static boolean contains(String cidr,String address){long size=1L<<(32-prefix(cidr));return ip(cidr.split("/")[0])/size==ip(address)/size;}
record Route(String cidr,int priority,String target) {}
static Route route(List<Route> routes,String destination){return routes.stream().filter(r->contains(r.cidr,destination)).min(Comparator.<Route>comparingInt(r->-prefix(r.cidr)).thenComparingInt(Route::priority)).orElse(null);}
record Rule(String direction,String cidr,int from,int to,String protocol,int priority,String action) {}
static boolean statelessAllowed(List<Rule> rules,String direction,String peer,int port,String protocol){return rules.stream().filter(r->r.direction.equals(direction)&&contains(r.cidr,peer)&&port>=r.from&&port<=r.to&&(r.protocol.equals("all")||r.protocol.equals(protocol))).min(Comparator.comparingInt(Rule::priority)).map(r->r.action.equals("allow")).orElse(false);}
}
