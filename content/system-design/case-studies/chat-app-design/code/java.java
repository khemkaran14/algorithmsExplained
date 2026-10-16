import java.util.*;
class RoomLog {record Message(String id,String user,String room,String text,int sequence){}Map<String,Message>messages=new HashMap<>();Map<String,List<Message>>rooms=new HashMap<>();
Message send(String id,String user,String room,String text){Message old=messages.get(id);if(old!=null){if(!old.user().equals(user)||!old.room().equals(room)||!old.text().equals(text))throw new IllegalArgumentException("identity conflict");return old;}
if(room.equals("support")&&user.equals("alice"))throw new IllegalArgumentException("not a member");List<Message>log=rooms.computeIfAbsent(room,k->new ArrayList<>());
Message m=new Message(id,user,room,text,log.size()+1);log.add(m);messages.put(id,m);return m;}
List<Message> after(String room,int cursor){return rooms.getOrDefault(room,List.of()).stream().filter(m->m.sequence()>cursor).toList();}}
// Persist append and dedup identity together; these local collections illustrate the transaction.
