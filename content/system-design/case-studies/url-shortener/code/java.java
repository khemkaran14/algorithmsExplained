import java.util.*;
class Links {
record Link(String url,boolean active){}record Request(String url,String code){}long next=1;Map<String,Link>links=new HashMap<>();Map<String,Request>keys=new HashMap<>();
String create(String key,String url){Request old=keys.get(key);if(old!=null){if(!old.url().equals(url))throw new IllegalArgumentException("key conflict");return old.code();}
String alphabet="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",code="";long n=next++;do{code=alphabet.charAt((int)(n%62))+code;n/=62;}while(n>0);while(code.length()<3)code="0"+code;
if(links.containsKey(code))throw new IllegalStateException("unique constraint");links.put(code,new Link(url,true));keys.put(key,new Request(url,code));return code;}
String resolve(String code){Link l=links.get(code);return l!=null&&l.active()?l.url():null;}
void revoke(String code){Link l=links.get(code);if(l!=null)links.put(code,new Link(l.url(),false));}}
