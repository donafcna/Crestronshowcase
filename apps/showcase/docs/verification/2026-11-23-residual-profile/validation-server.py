from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
import urllib.parse,mimetypes
root=Path('test-results/transitions-preview').resolve();scripts=Path('test-results')
class H(SimpleHTTPRequestHandler):
 def do_GET(self):
  name=urllib.parse.urlsplit(self.path).path
  if name in ['/validation-observer.js','/validation-ui.js']:f=scripts/name[1:]
  else:f=root/('index.html' if name.startswith('/interfaces/') else name.lstrip('/'))
  if not f.is_file():self.send_error(404);return
  b=f.read_bytes();typ=mimetypes.guess_type(str(f))[0] or 'application/octet-stream'
  if f.suffix=='.html':
   b=b.replace(b'<head>',b'<head><script src="/validation-observer.js"></script>')
   if name.startswith('/interfaces/'):b=b.replace(b'</body>',b'<script src="/validation-ui.js"></script></body>')
  self.send_response(200);self.send_header('Content-Type',typ);self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(b)
 def log_message(self,*a):pass
ThreadingHTTPServer(('127.0.0.1',4348),H).serve_forever()
