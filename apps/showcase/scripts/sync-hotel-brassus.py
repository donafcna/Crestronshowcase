"""Import the compiled HDH GUI, without changing the installation source.
Usage: python scripts/sync-hotel-brassus.py <CH5 project folder>
Adapters live alongside ch5/ and are intentionally not generated here.
"""
import hashlib
import json
from pathlib import Path
import shutil
import sys

root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1]).resolve()
compiled = source / 'dist/prod/Shell'
if not (compiled / 'index.html').is_file():
    raise SystemExit('Expected dist/prod/Shell/index.html in the CH5 project')
destination = root / 'public/showcases/hotel-brassus/ch5'
shutil.copytree(compiled, destination, dirs_exist_ok=True)
for name in ['LICENSE.txt', 'copyright.txt']:
    shutil.copy2(source / name, destination / name)
config_path = destination / 'assets/data/project-config.json'
config = json.loads(config_path.read_text(encoding='utf-8-sig'))
config['useWebXPanel'] = False
config['forceDeviceXPanel'] = False
config.get('config', {}).pop('controlSystem', None)
config_path.write_text(json.dumps(config, ensure_ascii=False, indent=2), encoding='utf-8')
html_path = destination / 'index.html'
html = html_path.read_text(encoding='utf-8')
html = html.replace('<head>', '<head><meta http-equiv="Content-Security-Policy" content="connect-src \'self\'; media-src \'none\'; object-src \'none\'">')
html = html.replace('</head>', '<link rel="stylesheet" href="../demo.css"></head>')
html = html.replace('<script src="./libraries/component.', '<script src="../demo-feedback.js"></script><script src="./libraries/component.')
html_path.write_text(html, encoding='utf-8')
manifest_path = root / 'docs/hotel-brassus-source-manifest.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8')) if manifest_path.exists() else {}
manifest.update(ch5Version=json.loads((source / 'package.json').read_text(encoding='utf-8-sig'))['version'], sourceFolder=source.name)
manifest['files'] = [{'path': p.relative_to(compiled).as_posix(), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(compiled.rglob('*')) if p.is_file()]
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Imported HDH {manifest["ch5Version"]}: {len(manifest["files"])} files')
