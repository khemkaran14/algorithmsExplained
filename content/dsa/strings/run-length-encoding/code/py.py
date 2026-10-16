def encode(text):
    runs=[]
    for ch in text:
        if runs and runs[-1][0]==ch: runs[-1][1]+=1
        else: runs.append([ch,1])
    return runs
