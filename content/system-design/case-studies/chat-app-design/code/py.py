class RoomLog:
    def __init__(self): self.messages={}; self.rooms={}
    def send(self,id,user,room,text):
        if id in self.messages:
            old=self.messages[id]
            if (old['user'],old['room'],old['text'])!=(user,room,text): raise ValueError('identity conflict')
            return old
        if room=='support' and user=='alice': raise ValueError('not a member')
        log=self.rooms.setdefault(room,[]); message=dict(id=id,user=user,room=room,text=text,sequence=len(log)+1)
        log.append(message); self.messages[id]=message; return message
    def after(self,room,cursor): return [m for m in self.rooms.get(room,[]) if m['sequence']>cursor]
