import secrets
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
def encrypt(key,plaintext):
    nonce=secrets.token_bytes(12)
    return nonce,AESGCM(key).encrypt(nonce,plaintext,None)
def decrypt(key,nonce,ciphertext_and_tag):
    return AESGCM(key).decrypt(nonce,ciphertext_and_tag,None)  # Raises on authentication failure.
