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
    if self.path.startswith('/interfaces/') and 'text/html' in typ:body=body.replace(b'</body>',b'<script src="/race-probe.js"></script></body>')
   except Exception as e:self.send_error(502,str(e));return
  self.send_response(200);self.send_header('Content-Type',typ);self.end_headers();self.wfile.write(body)
 def log_message(self,*args):pass
ThreadingHTTPServer(('127.0.0.1',4343),H).serve_forever()
