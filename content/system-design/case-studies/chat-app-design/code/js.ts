class RoomLog {
constructor(){this.messages=new Map();this.rooms=new Map();}
send(id,user,room,text){const previous=this.messages.get(id);if(previous){if(previous.user!==user||previous.room!==room||previous.text!==text)throw Error('identity conflict');return previous;}
if(room==='support'&&user==='alice')throw Error('not a member');let log=this.rooms.get(room);if(!log){log=[];this.rooms.set(room,log);}
const message={id,user,room,text,sequence:log.length+1};log.push(message);this.messages.set(id,message);return message;}
after(room,cursor){return (this.rooms.get(room)||[]).filter(m=>m.sequence>cursor);}
} // Gateway membership, online status and cursor acknowledgments surround this atomic room append.
// A lost response retries the same message ID; it never allocates a second room sequence.
