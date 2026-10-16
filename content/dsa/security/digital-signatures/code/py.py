from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.exceptions import InvalidSignature
key=Ed25519PrivateKey.generate()
def sign_message(data): return key.sign(data)
def verify_message(data,signature):
    try: key.public_key().verify(signature,data); return True
    except InvalidSignature: return False
