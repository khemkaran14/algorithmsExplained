def kmp(text,p):
    prefix=[0]*len(p); out=[]; j=0
    for i in range(1,len(p)):
        while j and p[i]!=p[j]: j=prefix[j-1]
        if p[i]==p[j]: j+=1
        prefix[i]=j
    j=0
    for i,ch in enumerate(text):
        while j and ch!=p[j]: j=prefix[j-1]
        if ch==p[j]: j+=1
        if j==len(p): out.append(i-j+1); j=prefix[j-1]
    return out
