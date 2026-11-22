"""Generate the public A10 demos from their CH5Z archives."""
import argparse
import io
import json
import re
from pathlib import Path
from zipfile import ZipFile

DEST = Path(__file__).resolve().parents[1] / "public/showcases/appartement-crans/xpanels"
SHARED_FILES = ("app.js", "app.css", "engine.js", "config.js", "assets/frequence-tv-white.png")
PUBLIC_FIELDS = {
    "rooms": ("id", "name", "floor", "icon"),
    "lights": ("roomId", "name", "index", "switched", "retired"),
    "shades": ("roomId", "name", "index", "kind"),
    "shadeGroups": ("roomId", "name", "index", "kind"),
    "scenes": ("roomId", "name", "index"),
    "climate": ("roomId", "name", "index", "hidden", "limits", "alsoRooms"),
}


def read_archive(path):
    with ZipFile(path) as outer:
        archive, = (name for name in outer.namelist() if name.endswith(".ch5"))
        with ZipFile(io.BytesIO(outer.read(archive))) as inner:
            return {name: inner.read(name) for name in (*SHARED_FILES, "index.html", "runtime.js")}


def read_assignment(value):
    return json.loads(value.decode("utf-8-sig").split("=", 1)[1].strip().rstrip(";"))


def write_assignment(name, variable, data):
    (DEST / name).write_text(
        f"window.{variable} = {json.dumps(data, ensure_ascii=False, separators=(',', ':'))};\n",
        encoding="utf-8",
    )


def replace_once(text, old, new):
    if text.count(old) != 1:
        raise ValueError(f"Unexpected A10 source near {old!r}")
    return text.replace(old, new, 1)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive_directory", type=Path)
    args = parser.parse_args()
    main_panel = read_archive(args.archive_directory / "a10-bench-xpanel.ch5z")
    climate_panel = read_archive(args.archive_directory / "a10-bench-climate.ch5z")
    mobile = read_archive(args.archive_directory / "a10-bench-mobile.ch5z")
    if any(main_panel[name] != panel[name] for panel in (climate_panel, mobile) for name in SHARED_FILES):
        raise ValueError("The A10 archives no longer share the same GUI build")

    source = read_assignment(main_panel["config.js"])
    config = {
        section: [{key: entry[key] for key in fields if key in entry} for entry in source[section]]
        for section, fields in PUBLIC_FIELDS.items()
    }
    for zone, original in zip(config["climate"], source["climate"], strict=True):
        zone["thermostat"] = bool(original.get("knx", {}).get("setpoint"))
    version = source["meta"]["version"]
    config["meta"] = {"version": version}

    app = main_panel["app.js"].decode("utf-8-sig")
    app = replace_once(app, "z.knx?.setpoint", "z.thermostat")
    app = replace_once(app, "A10 Climate · Fréquence TV", "Six Senses A10 · Climate")
    app = replace_once(app, "window.A10Bench={send,", "window.A10Bench={getRoom:()=>room,send,")
    app = replace_once(app, "demo=r.target==='demo'", "demo=true")
    app = replace_once(app, "connectionStatus.textContent='RMC4'", "connectionStatus.textContent='Demo'")
    start = app.index(" function script(src)")
    render = app.index(" render(true);\n if(demo)", start)
    live = app.index(" else try{\n  await script('vendor/webxpanel.js')", render)
    end = app.index("\n setInterval(", live)
    app = app[:start] + app[render:live] + app[end:]

    (DEST / "assets").mkdir(parents=True, exist_ok=True)
    for name in ("app.css", "assets/frequence-tv-white.png"):
        (DEST / name).write_bytes(main_panel[name])
    engine = main_panel["engine.js"].decode("utf-8-sig")
    engine = replace_once(engine, 'motion[id-1]=v===1?1:v===2?-1:0;', "motion[id-1]=v===1?1:v===2?-1:0;if(id>config.shades.length){const g=config.shadeGroups[id-config.shades.length-1],family=n=>/sheer/i.test(n)?'sheer':/blackout/i.test(n)?'blackout':/exterior/i.test(n)?'exterior':'roller',direction=n=>n.match(/east|south 1|south 2|north|south/)?.[0];config.shades.forEach(s=>{if(s.roomId===g.roomId&&family(s.name)===family(g.name)&&(!direction(g.name)||direction(s.name)===direction(g.name)))motion[s.index-1]=motion[id-1];});}")
    engine = replace_once(engine, 'let before=null,lease=0;const motion=Array(sh).fill(0);', "let before=null,lease=0;const motion=Array(sh).fill(0);\n  state.shadeMotion=motion;state.shadeAt=Date.now();\n  function advanceShades(){const now=Date.now(),elapsed=Math.max(0,now-state.shadeAt);motion.forEach((m,i)=>{state.shades[i]=Math.max(0,Math.min(100,state.shades[i]+m*elapsed/200));if([0,100].includes(state.shades[i]))motion[i]=0;});state.shadeAt=now;}\n  function emitFeedback(){if(scope.dispatchEvent)scope.dispatchEvent(new Event('a10-feedback'));}")
    engine = replace_once(engine, 'function command(client,seq,op,id,v){', 'function command(client,seq,op,id,v){\n   advanceShades();')
    engine = replace_once(engine, 'state.revision++;return true;', 'state.revision++;emitFeedback();return true;')
    engine = replace_once(engine, 'motion.forEach((m,i)=>{state.shades[i]=Math.max(0,Math.min(100,state.shades[i]+m*5));if([0,100].includes(state.shades[i]))motion[i]=0;});', 'advanceShades();')
    engine = replace_once(engine, 'state.revision++;}\n  return {state,command,tick,', 'state.revision++;emitFeedback();}\n  return {state,command,tick,')
    (DEST / "engine.js").write_text(engine, encoding="utf-8")
    app = replace_once(app, "fb+'% open'", "Math.round(fb)+'% open'")
    app = replace_once(app, 'target=Math.round(motionValue(m,now));ms=250;', 'target=motionValue(m,now);ms=0;')
    app = replace_once(app, "node.style.setProperty('--open',Math.round(m?motionValue(m,now):drawn.get(i)??target));", "node.style.setProperty('--open',m?motionValue(m,now):drawn.get(i)??target);")
    app = replace_once(app, 'main.innerHTML=', "const shadeVisuals=!force&&tab==='shades'?new Map([...main.querySelectorAll('[data-shade-visual]')].map(n=>[n.dataset.shadeVisual,n])):null;main.innerHTML=")
    app = replace_once(app, 'nav.innerHTML=Object.entries(icon)', "if(shadeVisuals)main.querySelectorAll('[data-shade-visual]').forEach(n=>{const previous=shadeVisuals.get(n.dataset.shadeVisual);if(previous)n.replaceWith(previous);});nav.innerHTML=Object.entries(icon)")
    app = app.replace("Fréquence TV", "Frequence TV")
    (DEST / "app.js").write_text(app, encoding="utf-8")
    write_assignment("config.js", "A10BenchConfig", config)
    for name, panel, target, mode, label in (
        ("main", main_panel, "xpanel", "", "XPanel"),
        ("climate", climate_panel, "xpanel", "climate", "Climate"),
        ("mobile", mobile, "mobile", "", "Crestron ONE"),
    ):
        runtime = read_assignment(panel["runtime.js"])
        if runtime.get("target") != target or runtime.get("mode", "") != mode:
            raise ValueError(f"Unexpected archive mode for {name}")
        write_assignment(f"runtime-{name}.js", "A10BenchRuntime", {
            "target": "demo", "mode": mode, "version": version,
            "buildDate": runtime.get("buildDate", ""),
        })
        html = panel["index.html"].decode("utf-8-sig")
        title = f"<title>Six Senses A10 · {label}</title>"
        policy = """<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; form-action 'none'">"""
        html = re.sub(r"<title>.*?</title>", title + policy, html, count=1)
        html = replace_once(html, 'src="runtime.js', f'src="runtime-{name}.js')
        html = replace_once(html, "<strong>Apartment A10</strong>", f"<strong>Six Senses A10 · {label}</strong>")
        (DEST / f"{name}.html").write_text(html, encoding="utf-8")


if __name__ == "__main__":
    main()
