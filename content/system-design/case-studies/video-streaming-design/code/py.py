def playback(bandwidth,adaptive=True,buffer=2,estimate=1,seconds=2):
    stall=0; segment=0; history=[]
    for capacity in bandwidth:
        if capacity==0:
            stall+=max(0,seconds-buffer); buffer=max(0,buffer-seconds); history.append((segment,None,buffer)); continue
        budget=estimate*(0.7 if buffer<seconds else 1); quality=4
        if adaptive: quality=max([0.5]+[r for r in [0.5,1,2,4] if r<=budget])
        duration=quality*seconds/capacity; stall+=max(0,duration-buffer); buffer=max(0,buffer-duration)+seconds
        estimate=0.7*estimate+0.3*capacity; history.append((segment,quality,buffer)); segment+=1
    return stall,segment,history
