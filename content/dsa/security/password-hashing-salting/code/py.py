import secrets
import hashlib
def hash_password(password):
    salt=secrets.token_bytes(16)
    digest=hashlib.scrypt(password.encode('utf-8'),salt=salt,n=131072,r=8,p=1,maxmem=256*1024*1024,dklen=32)
    return {'algorithm':'scrypt','N':131072,'r':8,'p':1,'salt':salt,'hash':digest}  # Calibrate and store parameters.
