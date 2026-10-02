#!/usr/bin/env python3
"""
Assemble le projet « Appartement Crans-Montana » à partir du Core Villa Crans. Idempotent, ré-exécutable.

  python3 tools/assemble.py            (depuis projects/appartement-crans/ ou n'importe où)
  python3 tools/assemble.py --no-simpl (sans régénérer le .smw)

Étapes :
  a) GUI CH5   : projects/villa-ftv/ch5/src → ch5/src (sans user_original_html.txt, funny.mp3, villa_config.*),
                 puis ch5/src/villa_config.json + villa_config.js (window.villaConfigEmbedded) écrits depuis
                 villa_config.json du projet ; ch5/version.json créé s'il manque ; src/version.js aligné.
                 deploy.ps1 (ASCII + BOM, noms de projet adaptés), tools/ et package.json du Core copiés dans ch5/.
  b) C# slot 1 : Backend/Backend/*.cs + csproj + packages.config + .sln → simpl-sharp/AppartementCrans/,
                 assembly / namespace / projet renommés AppartementCrans, version 1.0.0.0.
  c) SIMPL     : node tools/generate_slot2.js puis node tools/check_slot2.js.
  d) Contrôles : villa_config.js chargé par index.html / iphone.html, node --check des <script> inline
                 (même extraction que deploy.ps1), grep des références Villaftv résiduelles.
Toute modification fonctionnelle se fait dans le Core, jamais dans les copies produites ici.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import uuid
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROJ = HERE.parent
CORE_CH5 = PROJ.parent / "villa-ftv" / "ch5"
CORE_CS = CORE_CH5 / "Backend"
CONFIG = PROJ / "villa_config.json"
CH5 = PROJ / "ch5"
CS_DIR = PROJ / "simpl-sharp"
CS_PROJ = CS_DIR / "AppartementCrans"
NAME = "AppartementCrans"
NAME_LOWER = "appartementcrans"
HEADER = "// Copie générée du Core Villa Crans par tools/assemble.py — ne pas éditer ici, corriger dans le Core"
BOM = b"\xef\xbb\xbf"
NO_SIMPL = "--no-simpl" in sys.argv
errors = []


def log(msg):
    print(msg, flush=True)


def write_text(path: Path, text: str, bom=False, newline="\n"):
    path.parent.mkdir(parents=True, exist_ok=True)
    data = text.replace("\r\n", "\n").replace("\n", newline).encode("utf-8")
    path.write_bytes((BOM if bom else b"") + data)


# ------------------------------------------------------------------ a) GUI CH5
def assemble_ch5():
    src, dst = CORE_CH5 / "src", CH5 / "src"
    excl = {"user_original_html.txt", "funny.mp3", "villa_config.json", "villa_config.js"}
    if dst.exists():
        shutil.rmtree(dst)
    shutil.copytree(src, dst, ignore=lambda d, names: [n for n in names if n in excl])
    cfg_raw = CONFIG.read_text(encoding="utf-8")
    cfg = json.loads(cfg_raw)
    if cfg.get("meta", {}).get("mode") != "deploiement":
        errors.append("meta.mode doit valoir 'deploiement' dans villa_config.json (jamais 'showcase' ici)")
    (dst / "villa_config.json").write_text(cfg_raw, encoding="utf-8")
    (dst / "villa_config.js").write_text("window.villaConfigEmbedded = " + cfg_raw.rstrip() + ";", encoding="utf-8")
    # Version : créée à 1.0.0 si absente (deploy.ps1 l'incrémente à chaque build, on ne la réinitialise pas)
    ver_file = CH5 / "version.json"
    if not ver_file.exists():
        write_text(ver_file, '{\n  "version": "1.0.0"\n}\n')
    version = json.loads(ver_file.read_text(encoding="utf-8"))["version"]
    if cfg.get("meta", {}).get("version") != version:
        log(f"  attention : meta.version ({cfg.get('meta', {}).get('version')}) != ch5/version.json ({version}) — aligner à la main")
    write_text(dst / "version.js", f"window.appVersion = 'v{version}';")
    write_text(dst / "build_date.json", '{"compileDate":"' + datetime.now().strftime("%d/%m/%Y %H:%M:%S") + '"}')
    n_files = sum(1 for _ in dst.rglob("*") if _.is_file())
    log(f"  ch5/src : {n_files} fichiers copiés depuis le Core, villa_config.js/json du projet, version v{version}")

    # deploy.ps1 : ASCII pur + BOM (PowerShell 5.1), noms de projet adaptés
    raw = (CORE_CH5 / "deploy.ps1").read_bytes()
    if not raw.startswith(BOM):
        errors.append("deploy.ps1 du Core sans BOM")
    body = raw[len(BOM):] if raw.startswith(BOM) else raw
    if any(b > 0x7F for b in body):
        errors.append("deploy.ps1 du Core contient des octets hors ASCII : copie non adaptée")
        (CH5 / "deploy.ps1").write_bytes(raw)
    else:
        text = body.decode("ascii")
        text = text.replace("Deploiement Villa Crans", "Deploiement Appartement Crans-Montana (copie du Core Villa Crans par tools/assemble.py, ne pas editer ici)")
        text = text.replace("Backend\\Backend\\bin\\Debug\\Villaftv.cpz", f"..\\simpl-sharp\\{NAME}\\bin\\Debug\\{NAME}.cpz")
        text = text.replace("Villaftv.cpz", f"{NAME}.cpz").replace("villaftv", NAME_LOWER)
        # Source unique : villa_config.json vit a la racine du projet, pas dans ch5/
        text = text.replace("Join-Path $root 'villa_config.json'", "Join-Path $root '..\\villa_config.json'")
        if text.count("..\\villa_config.json") != 4:
            errors.append("deploy.ps1 : références villa_config.json inattendues (" + str(text.count("..\\villa_config.json")) + " au lieu de 4)")
        assert all(ord(c) < 0x80 for c in text)
        (CH5 / "deploy.ps1").write_bytes(BOM + text.encode("ascii"))
    for name in ("package.json", "package-lock.json"):
        if (CORE_CH5 / name).exists():
            shutil.copy2(CORE_CH5 / name, CH5 / name)
    tools_dst = CH5 / "tools"
    tools_dst.mkdir(exist_ok=True)
    for name in ("ch5-compat.js", "serve_src.mjs", "check_contrast.mjs", "check_contrast_dom.mjs", "gen_qr.js"):
        p = CORE_CH5 / "tools" / name
        if p.exists():
            if name == "gen_qr.js":
                t = p.read_text(encoding="utf-8").replace("/villaftv/", f"/{NAME_LOWER}/").replace("Villa Crans", "Appartement Crans-Montana")
                t = t.replace("opt('config', 'villa_config.json')", "opt('config', '../villa_config.json')")  # source unique a la racine du projet
                (tools_dst / name).write_text(t, encoding="utf-8")
            else:
                shutil.copy2(p, tools_dst / name)
    secrets_example = CH5 / "deploy.secrets.example.psd1"
    if not secrets_example.exists():
        write_text(secrets_example, EXAMPLE_SECRETS, bom=True)
    log("  ch5/deploy.ps1 (ASCII + BOM), tools/, package.json copiés ; deploy.secrets.example.psd1 disponible")


EXAMPLE_SECRETS = """# Identifiants de deploiement (copier en deploy.secrets.psd1, jamais commite).
# Cles lues par deploy.ps1 : TSW / CP4 { Host, User, Password, HostKeys }, CP4.Slot, CP4.WebAuthToken.
@{
    TSW = @{
        Host     = '192.168.1.16'
        User     = 'REMPLACEZ_MOI'
        Password = 'REMPLACEZ_MOI'
        HostKeys = @()            # ex. @('ssh-ed25519 255 SHA256:...') pour plink/pscp non interactifs
    }
    CP4 = @{
        Host     = '192.168.1.200'
        User     = 'REMPLACEZ_MOI'
        Password = 'REMPLACEZ_MOI'
        HostKeys = @()
        Slot     = '01'
        # WebAuthToken = ''       # jeton du serveur web du CP4, passe dans les QR (?authtoken=)
    }
}
"""


# ------------------------------------------------------------------ b) C# slot 1
def assemble_csharp():
    CS_PROJ.mkdir(parents=True, exist_ok=True)
    (CS_PROJ / "Properties").mkdir(exist_ok=True)
    guid = str(uuid.uuid5(uuid.NAMESPACE_URL, "appartement-crans/simpl-sharp")).upper()
    for name in ("ControlSystem.cs", "HvacState.cs", "WellnessState.cs"):
        raw = (CORE_CS / "Backend" / name).read_bytes()
        bom = raw.startswith(BOM)
        text = raw[len(BOM):].decode("utf-8") if bom else raw.decode("utf-8")
        text = text.replace("namespace VillaFrequenceTvAutomation", f"namespace {NAME}")
        text = text.replace('"villaftv.cpz"', f'"{NAME}.cpz"').replace('"villaftv"', f'"{NAME_LOWER}"').replace("/villaftv/", f"/{NAME_LOWER}/")
        nl = "\r\n" if "\r\n" in text else "\n"
        write_text(CS_PROJ / name, HEADER + "\n" + text, bom=True, newline=nl)
    asm = (CORE_CS / "Backend" / "Properties" / "AssemblyInfo.cs").read_bytes()[len(BOM):].decode("utf-8")
    asm = re.sub(r'AssemblyTitle\("[^"]*"\)', f'AssemblyTitle("{NAME}")', asm)
    asm = re.sub(r'AssemblyProduct\("[^"]*"\)', f'AssemblyProduct("{NAME}")', asm)
    asm = re.sub(r'AssemblyDescription\("[^"]*"\)', 'AssemblyDescription("Appartement Crans-Montana - SIMPL# Pro slot 1 (copie du Core Villa Crans)")', asm)
    asm = re.sub(r'AssemblyCompany\("[^"]*"\)', 'AssemblyCompany("Fréquence TV")', asm)
    asm = re.sub(r'Guid\("[^"]*"\)', f'Guid("{guid.lower()}")', asm)
    asm = re.sub(r'AssemblyVersion\("[^"]*"\)', 'AssemblyVersion("1.0.0.0")', asm)
    asm = re.sub(r'AssemblyFileVersion\("[^"]*"\)', 'AssemblyFileVersion("1.0.0.0")', asm)
    write_text(CS_PROJ / "Properties" / "AssemblyInfo.cs", HEADER + "\n" + asm, bom=True, newline="\r\n" if "\r\n" in asm else "\n")
    csproj = (CORE_CS / "Backend" / "Villaftv.csproj").read_bytes()[len(BOM):].decode("utf-8")
    csproj = re.sub(r"<ProjectGuid>\{[^}]*\}</ProjectGuid>", f"<ProjectGuid>{{{guid}}}</ProjectGuid>", csproj)
    csproj = csproj.replace("<RootNamespace>Villaftv</RootNamespace>", f"<RootNamespace>{NAME}</RootNamespace>")
    csproj = csproj.replace("<AssemblyName>Villaftv</AssemblyName>", f"<AssemblyName>{NAME}</AssemblyName>")
    csproj = csproj.replace("<Project ToolsVersion", f"<!-- {HEADER[3:]} -->\n<Project ToolsVersion", 1)
    write_text(CS_PROJ / f"{NAME}.csproj", csproj, bom=True, newline="\r\n" if "\r\n" in csproj else "\n")
    shutil.copy2(CORE_CS / "Backend" / "packages.config", CS_PROJ / "packages.config")
    sln = (CORE_CS / "Villaftv.sln").read_bytes()[len(BOM):].decode("utf-8")
    sln = sln.replace('"Villaftv", "Backend\\Villaftv.csproj"', f'"{NAME}", "{NAME}\\{NAME}.csproj"')
    sln = re.sub(r"\{7D31EFEF-38A2-48D1-9751-B611C77B4DE4\}", "{" + guid + "}", sln)
    sln = re.sub(r"SolutionGuid = \{[^}]*\}", "SolutionGuid = {" + str(uuid.uuid5(uuid.NAMESPACE_URL, "appartement-crans/sln")).upper() + "}", sln)
    write_text(CS_DIR / f"{NAME}.sln", sln, bom=True, newline="\r\n" if "\r\n" in sln else "\n")
    # Vérification du renommage
    leftovers = []
    for p in list(CS_PROJ.rglob("*.cs")) + [CS_PROJ / f"{NAME}.csproj", CS_DIR / f"{NAME}.sln"]:
        t = p.read_text(encoding="utf-8-sig")
        for m in re.finditer(r"Villaftv|villaftv|VillaFrequenceTvAutomation", t):
            leftovers.append(f"{p.relative_to(PROJ)} : {m.group(0)}")
    if leftovers:
        errors.append("références Villaftv résiduelles : " + ", ".join(leftovers))
    ns = {re.search(r"^namespace (\w+)", (CS_PROJ / n).read_text(encoding="utf-8-sig"), re.M).group(1) for n in ("ControlSystem.cs", "HvacState.cs", "WellnessState.cs")}
    if ns != {NAME}:
        errors.append(f"namespaces incohérents : {ns}")
    log(f"  simpl-sharp/{NAME}/ : 3 .cs + AssemblyInfo + csproj + packages.config + .sln, namespace/assembly {NAME} 1.0.0.0, GUID {guid}")


# ------------------------------------------------------------------ c) SIMPL slot 2
def run(cmd, cwd=PROJ):
    r = subprocess.run(cmd, cwd=str(cwd), capture_output=True, text=True)
    return r.returncode, (r.stdout + r.stderr).strip()


def assemble_simpl():
    code, out = run(["node", str(HERE / "generate_slot2.js")])
    log("  " + out.replace("\n", "\n  "))
    if code:
        errors.append("generate_slot2.js en échec")
        return
    code, out = run(["node", str(HERE / "check_slot2.js")])
    log("  " + out.replace("\n", "\n  "))
    if code:
        errors.append("check_slot2.js en échec")


# ------------------------------------------------------------------ d) contrôles GUI
SCRIPT_RX = re.compile(r"(?is)<script\b([^>]*)>(.*?)</script>")


def check_gui():
    tmp = Path(os.environ.get("TMPDIR", "/tmp")) / "appartementcrans_script_check.js"
    for fname in ("index.html", "iphone.html"):
        html = (CH5 / "src" / fname).read_text(encoding="utf-8")
        if 'src="villa_config.js"' not in html:
            errors.append(f"{fname} ne charge pas villa_config.js")
        n = bad = 0
        for m in SCRIPT_RX.finditer(html):
            attrs, code = m.group(1), m.group(2)
            if re.search(r"\bsrc\s*=", attrs):
                continue
            t = re.search(r"type\s*=\s*[\"']([^\"']+)", attrs)
            if t and not re.search(r"javascript|module|ecmascript", t.group(1)):
                continue
            if not code.strip():
                continue
            n += 1
            tmp.write_text(code, encoding="utf-8")
            rc, out = run(["node", "--check", str(tmp)])
            if rc:
                bad += 1
                line = html[: m.start()].count("\n") + 1
                errors.append(f"{fname} : bloc <script> n°{n} (ligne {line}) invalide : {out.splitlines()[-1] if out else ''}")
        log(f"  {fname} : villa_config.js chargé, {n} bloc(s) <script> inline, {bad} en erreur")
    if tmp.exists():
        tmp.unlink()
    emb = json.loads((CH5 / "src" / "villa_config.js").read_text(encoding="utf-8")[len("window.villaConfigEmbedded = "):-1])
    log(f"  villa_config.js embarqué : {emb['meta']['projet']} v{emb['meta']['version']}, {len(emb['pieces'])} pièces, mode {emb['meta']['mode']}")


if __name__ == "__main__":
    log("a) GUI CH5")
    assemble_ch5()
    log("b) C# slot 1")
    assemble_csharp()
    if NO_SIMPL:
        log("c) SIMPL slot 2 : ignoré (--no-simpl)")
    else:
        log("c) SIMPL slot 2")
        assemble_simpl()
    log("d) contrôles")
    check_gui()
    if errors:
        log("ROUGE : " + str(len(errors)) + " défaut(s)\n - " + "\n - ".join(errors))
        sys.exit(1)
    log("VERT : assemblage terminé.")
