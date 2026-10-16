def rabin_karp(text,p):
    mod,base,m=1000000007,257,len(p); out=[]
    if m>len(text): return out
    high=pow(base,m-1,mod); ph=wh=0
    for i in range(m): ph=(ph*base+ord(p[i]))%mod; wh=(wh*base+ord(text[i]))%mod
    for start in range(len(text)-m+1):
        if ph==wh and text[start:start+m]==p: out.append(start)
        if start+m<len(text): wh=((wh-ord(text[start])*high)*base+ord(text[start+m]))%mod
    return out
