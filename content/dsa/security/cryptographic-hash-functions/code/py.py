import hashlib
def sha256(data):
    digest=hashlib.sha256()
    digest.update(data)
    # Use bytes; text callers choose an explicit encoding.
    return digest.hexdigest()
