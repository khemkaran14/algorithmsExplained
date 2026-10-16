def manacher(s):
    odd=[0]*len(s); even=[0]*len(s); best_start=0; best_length=1
    for parity in range(2):
        d=even if parity else odd; left=0; right=-1
        for i in range(len(s)):
            k=(0 if parity else 1) if i>right else min(d[left+right-i+(1 if parity else 0)],right-i+1)
            while i+k<len(s) and i-k-(1 if parity else 0)>=0 and s[i+k]==s[i-k-(1 if parity else 0)]: k+=1
            d[i]=k; start=i-k+(0 if parity else 1); length=2*k-(0 if parity else 1)
            if length>best_length: best_start,best_length=start,length
            if i+k-1>right: left,right=start,i+k-1
    return odd,even,s[best_start:best_start+best_length]
