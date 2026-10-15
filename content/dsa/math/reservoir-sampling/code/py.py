from random import randrange

def reservoir(stream,k):
    sample=stream[:k]
    for i in range(k,len(stream)):
        j=randrange(i+1)
        if j<k:sample[j]=stream[i]
    return sample
