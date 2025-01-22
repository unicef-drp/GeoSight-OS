import hashlib

def generate_cache_key(url, payload):
    """
    Generate a unique cache key based on the URL and payload.
    """
    payload_hash = hashlib.sha256(str(payload).encode('utf-8')).hexdigest()
    return f"cache:{url}:{payload_hash}"
