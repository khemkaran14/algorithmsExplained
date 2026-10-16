import secrets
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
def encrypt(key,plaintext,aad):
    nonce=secrets.token_bytes(12)
    return nonce,AESGCM(key).encrypt(nonce,plaintext,aad)
def decrypt(key,nonce,ciphertext_and_tag,aad):
    return AESGCM(key).decrypt(nonce,ciphertext_and_tag,aad)  # Raises on authentication failure.

def store(kek, version, identity, plaintext):
    dek = secrets.token_bytes(32)
    return dict(version=version, identity=identity,
                payload=encrypt(dek, plaintext, identity.encode()),
                wrapped=encrypt(kek, dek, f'{identity}:{version}'.encode()))
def read(kek, record):
    dek = decrypt(kek, *record['wrapped'], f"{record['identity']}:{record['version']}".encode())
    return decrypt(dek, *record['payload'], record['identity'].encode())
def rewrap(old_kek, new_kek, record, version):
    dek = decrypt(old_kek, *record['wrapped'], f"{record['identity']}:{record['version']}".encode())
    return dict(record, version=version, wrapped=encrypt(new_kek, dek, f"{record['identity']}:{version}".encode()))
