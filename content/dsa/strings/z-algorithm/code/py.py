def z_matches(text,p):
    s=p+'\0'+text; z=[0]*len(s); left=0; right=-1; out=[]
    for i in range(1,len(s)):
        if i<=right: z[i]=min(right-i+1,z[i-left])
        while i+z[i]<len(s) and s[z[i]]==s[i+z[i]]: z[i]+=1
        if i+z[i]-1>right: left,right=i,i+z[i]-1
        if i>len(p) and z[i]>=len(p): out.append(i-len(p)-1)
    return out
