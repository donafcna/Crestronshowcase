#!/usr/bin/env python3
"""Contrôle croisé GUI <-> SIMPL : chaque join du contrat S (villa_config.json > contrat.simplDirect.mapping) doit
arriver sur un signal de la dalle (appui O et/ou retour I) pour chaque pièce, et chaque join global émis par le GUI
doit exister. Usage : python3 croiser_contrat.py [dossier]"""
import re, sys, json, os
D = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
cfg = json.load(open(os.path.join(D, '..', '..', 'ch5', 'villa_config.json'), encoding='utf-8'))
sd = cfg['contrat']['simplDirect']; B, T = sd['baseBloc'], sd['tailleBloc']
raw = open(os.path.join(D, 'VillaCrans_Direct.smw'), encoding='latin-1', newline='').read()
objs = [dict(l.split('=', 1) for l in b.split('\r\n') if '=' in l) for b in re.findall(r'\[\r\n(.*?)\r\n\]', raw, re.S)]
sg = {o['H']: o['Nm'] for o in objs if o.get('ObjTp') == 'Sg'}
tsw = next(o for o in objs if o.get('SmC') == '6838')
nD, nA = int(tsw['n1I']), int(tsw['n2I'])
def idx(t, j): return j if t == 'd' else nD + j if t == 'a' else nD + nA + j
rooms = [p['id'] for p in cfg['pieces'] if p['id'] <= sd['pieceMax']]
manque, seulAppui, seulRetour = [], set(), set()
for t, key in (('d', 'digital'), ('a', 'analog'), ('s', 'serial')):
    for L, off in sd['mapping'][key].items():
        for r in rooms:
            j = B + (r - 1) * T + off
            o, i = tsw.get('O%d' % idx(t, j)), tsw.get('I%d' % idx(t, j))
            if not o and not i: manque.append(f'{t}{L} (pièce {r}, join {j})')
            elif o and not i: seulAppui.add(t + L)
            elif i and not o: seulRetour.add(t + L)
glob = {'d': [41, 42, 44, 45, 46] + list(range(301, 313)) + list(range(401, 412)), 's': [43], 'a': [sd['telecommandes']['pieceAnalog']]}
for t, js in glob.items():
    for j in js:
        if not tsw.get('O%d' % idx(t, j)) and not tsw.get('I%d' % idx(t, j)): manque.append(f'{t}{j} global')
print('Joins sans signal :', len(manque)); [print('  -', m) for m in sorted(set(x.split(' (')[0] for x in manque))]
print('Appui seul (pas de retour attendu) :', ' '.join(sorted(seulAppui, key=lambda x: (x[0], int(x[1:])))))
print('Retour seul :', ' '.join(sorted(seulRetour, key=lambda x: (x[0], int(x[1:])))))
sys.exit(1 if [m for m in manque if not m.startswith('s10')] else 0)
