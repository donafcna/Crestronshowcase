from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
from pathlib import Path
import time
class H(BaseHTTPRequestHandler):
 def do_GET(self):
  self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.end_headers()
  self.wfile.write(b'<!doctype html><html><head><title>Temoin sans code projet</title><script>'+Path('test-results/observer-probe.js').read_bytes()+b'</script></head>');self.wfile.flush()
  time.sleep(2 if 'slow' in self.path else 0)
  self.wfile.write(b'<body><h1>Temoin sans React, CH5 ou Three.js</h1><p>Aucun observateur du projet.</p></body></html>')
 def log_message(self,*args):pass
ThreadingHTTPServer(('127.0.0.1',4346),H).serve_forever()
