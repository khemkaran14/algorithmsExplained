def matches(text,pattern):
    out=[]
    for i in range(len(text)-len(pattern)+1):
        j=0
        while j<len(pattern) and text[i+j]==pattern[j]: j+=1
        if j==len(pattern): out.append(i)
    return out
