from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
import urllib.request,json,hashlib
from pathlib import Path
root=Path(__file__).parent
class H(BaseHTTPRequestHandler):
 def do_GET(self):
  if self.path=='/race-probe.js':
   body=(root/'race-probe.js').read_bytes();typ='text/javascript'
  else:
   try:
    r=urllib.request.urlopen('https://crestrongui.vercel.app'+self.path,timeout=30);body=r.read();typ=r.headers.get('Content-Type','application/octet-stream')
    if 'text/html' in typ:body=body.replace(b'<head>',b'<head><script>'+ (root/'observer-probe.js').read_bytes()+b'</script>')
   except Exception as e:self.send_error(502,str(e));return
  self.send_response(200);self.send_header('Content-Type',typ);self.end_headers();self.wfile.write(body)
 def log_message(self,*args):pass
ThreadingHTTPServer(('127.0.0.1',4344),H).serve_forever()
