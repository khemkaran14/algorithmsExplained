import ssl
import urllib.request
import urllib.parse
def fetch_secure(url):
    if urllib.parse.urlparse(url).scheme!='https': raise ValueError('HTTPS required')
    with urllib.request.urlopen(url,context=ssl.create_default_context(),timeout=20) as response: return response.status
