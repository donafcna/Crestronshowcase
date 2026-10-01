#!/usr/bin/env python3
"""Contrôle structurel de VillaCrans_Direct.smw (sans SIMPL Windows) :
handles uniques, références résolues, un seul module source par signal de retour, joins de dalle = contrat,
et index SIMPL+ = ordre de déclaration du .usp. Usage : python3 verifier_smw.py [dossier]"""
import re, sys, json, os
from collections import defaultdict, Counter
D = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
raw = open(os.path.join(D, 'VillaCrans_Direct.smw'), encoding='latin-1', newline='').read()
assert raw.count('\r\n') == raw.count('\n'), 'fins de ligne non CRLF'
blocks = re.findall(r'\[\r\n(.*?)\r\n\]', raw, re.S)
objs = [dict(l.split('=', 1) for l in b.split('\r\n') if '=' in l) for b in blocks]
err = []
# en-tête : limites de SIMPL Windows à la compilation
for o in objs:
    if o.get('ObjTp') == 'Hd' and len(o.get('PIT', '')) > 20: err.append(f"Program ID Tag trop long ({len(o['PIT'])} > 20) : {o['PIT']}")
H = defaultdict(set)
for o in objs:
    t = o.get('ObjTp')
    if 'H' in o and t in ('Dv', 'Sm', 'Sg', 'Db', 'Et', 'Cs'):
        for part in o['H'].split(','):
            a, _, b = part.partition('.')
            for h in range(int(a), int(b or a) + 1):
                if h in H[t]: err.append(f'handle {t} {h} en double')
                H[t].add(h)
sg = {int(o['H']): o for o in objs if o.get('ObjTp') == 'Sg'}
drv = defaultdict(list); used = Counter()
for o in objs:
    if o.get('ObjTp') != 'Sm': continue
    for k, v in o.items():
        m = re.match(r'([IO])(\d+)$', k)
        if not m: continue
        h = int(v)
        if h not in sg: err.append(f"Sm {o['H']} {k} -> signal {h} inexistant"); continue
        used[h] += 1
        if m.group(1) == 'O': drv[h].append((o['Nm'], o['H']))
    for i in range(1, int(o.get('mC', 0)) + 1):
        if int(o['C%d' % i]) not in H['Sm']: err.append(f"Sm {o['H']} enfant {o['C%d' % i]} absent")
for o in objs:
    if o.get('ObjTp') == 'Dv' and 'SmH' in o and int(o['SmH']) not in H['Sm']: err.append(f"Dv {o['H']} SmH absent")
    if o.get('ObjTp') in ('Db', 'Et') and int(o['DvH']) not in H['Dv']: err.append(f"{o['ObjTp']} {o['H']} DvH absent")
# Un signal ne peut être piloté que par UNE famille : dalles (toutes ensemble) OU un seul module.
for h, lst in drv.items():
    mods = {x for x in lst if x[0].endswith('.usp')}
    pans = [x for x in lst if not x[0].endswith('.usp')]
    if len(mods) > 1 or (mods and pans): err.append(f"signal {sg[h]['Nm']} piloté par {lst[:3]}")
unused = [sg[h]['Nm'] for h in sg if not used[h]]
if unused: err.append(f'{len(unused)} signaux jamais utilisés : {unused[:5]}')
# Index SIMPL+ = ordre du .usp
def usp_counts(path):
    s = open(path, encoding='latin-1').read()
    s = re.sub(r'/\*.*?\*/', '', s, flags=re.S); s = re.sub(r'//[^\n]*', '', s)
    consts = {m.group(1): int(m.group(2)) for m in re.finditer(r'#DEFINE_CONSTANT\s+(\w+)\s+(\d+)', s)}
    n = Counter()
    for kind, body in re.findall(r'\b(DIGITAL_INPUT|ANALOG_INPUT|STRING_INPUT|DIGITAL_OUTPUT|ANALOG_OUTPUT|STRING_OUTPUT)\b(.*?);', s, re.S):
        for it in [x.strip() for x in body.split(',') if x.strip()]:
            br = re.findall(r'\[(\w+)\]', it)
            ev = lambda a: consts.get(a, None) or int(a)
            k = (ev(br[0]) if len(br) == 2 else 1) if kind == 'STRING_INPUT' else (ev(br[0]) if br else 1)
            n['DI' if kind == 'DIGITAL_INPUT' else 'AI' if kind.endswith('INPUT') else 'DO' if kind == 'DIGITAL_OUTPUT' else 'AO'] += k
    return n
# Règle SIMPL+ 1307 : dans une famille d'E/S (digital in, analog+série in, digital out, analog+série out) et dans une
# déclaration de variables, aucun signal simple après un tableau.
def lint_1307(path):
    t = open(path, encoding='latin-1').read()
    t = re.sub(r'/\*.*?\*/', '', t, flags=re.S); t = re.sub(r'//[^\n]*', '', t)
    fam = {'DIGITAL_INPUT': 'di', 'ANALOG_INPUT': 'ai', 'STRING_INPUT': 'ai', 'DIGITAL_OUTPUT': 'do', 'ANALOG_OUTPUT': 'ao', 'STRING_OUTPUT': 'ao'}
    seen = set(); out = []
    for kind, body in re.findall(r'\b(DIGITAL_INPUT|ANALOG_INPUT|STRING_INPUT|DIGITAL_OUTPUT|ANALOG_OUTPUT|STRING_OUTPUT)\b(.*?);', t, re.S):
        for it in [x.strip() for x in body.split(',') if x.strip()]:
            arr = len(re.findall(r'\[', it)) > (1 if kind == 'STRING_INPUT' else 0)
            if arr: seen.add(fam[kind])
            elif fam[kind] in seen: out.append(f'{os.path.basename(path)} : {it} apres un tableau ({kind})')
    for body in re.findall(r'^\s*(?:NONVOLATILE\s+)?INTEGER\s+([^;(]*);', t, re.M):
        items = [x.strip() for x in body.split(',')]
        k = next((i for i, x in enumerate(items) if '[' in x), None)
        if k is not None and any('[' not in x for x in items[k:]): out.append(f'{os.path.basename(path)} : INTEGER {body.strip()[:60]}')
    return out
for f in sorted(os.listdir(D)):
    if f.endswith('.usp'): err.extend(lint_1307(os.path.join(D, f)))
for o in objs:
    if o.get('ObjTp') == 'Sm' and o.get('SmC') == '103':
        n = usp_counts(os.path.join(D, o['Nm']))
        exp = (int(o['n1I']), int(o['n2I']), int(o['n1O']), int(o['mO']) - int(o['n1O']))
        got = (n['DI'], n['AI'], n['DO'], n['AO'])
        if exp != got: err.append(f"{o['Nm']} : SMW {exp} != usp {got}")
print('Objets :', Counter(o.get('ObjTp') for o in objs))
print('Signaux :', len(sg), '| dalles :', sum(1 for o in objs if o.get('ObjTp') == 'Sm' and o.get('SmC') in ('6838', '7140', '16459')),
      '| modules SIMPL+ :', sum(1 for o in objs if o.get('SmC') == '103'))
# module de pièce unique : chaque instance porte son numéro de pièce (P2), sans doublon
pc = [(o.get('Cmn1', ''), o.get('P2', '')) for o in objs if o.get('ObjTp') == 'Sm' and o.get('Nm') == 'VillaPiece.usp']
for c, v in pc:
    m = re.match(r'Piece (\d+)', c)
    if not m or v != str(int(m.group(1))) + 'd': err.append(f'instance {c} : paramètre Piece = {v!r}')
if len({v for _, v in pc}) != len(pc): err.append('paramètre Piece en double')
print('ERREURS :' if err else 'Aucune erreur structurelle.'); [print(' -', e) for e in err[:30]]
sys.exit(1 if err else 0)
