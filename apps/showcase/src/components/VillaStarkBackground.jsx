import { useEffect, useRef } from "react";

// Each Showcase owns a channel: two open projects cannot exchange commands.
export function VillaStarkBackground({ channel, stageRef }) {
  const background = useRef(null);
  useEffect(() => {
    const root = stageRef.current;
    if (!root) return;
    let frame = 0;
    const update = () => {
      const box = root.getBoundingClientRect();
      const chassis = root.querySelector(".device-stage > .phone-device-frame, .device-stage > .tablet-device-frame, .device-stage > .crestron-panel-frame, .device-stage > .desktop-browser-frame");
      const sidebar = root.querySelector(".workspace-device-sidebar");
      const row = root.querySelector(".workspace-main-content-row");
      if (!chassis || !sidebar || !row || !box.width || !box.height) return;
      const device = chassis.getBoundingClientRect(), tools = sidebar.getBoundingClientRect(), area = row.getBoundingClientRect();
      const left = Math.max(0, device.right - box.left + 22);
      const right = Math.min(box.width, tools.left - box.left - 18);
      const top = Math.max(0, area.top - box.top + 12);
      background.current?.contentWindow?.postMessage({ type: "villa-stark-layout", rect: { x: left, y: top, width: Math.max(100, right - left), height: Math.max(120, Math.min(box.height - 20, area.bottom - box.top) - top) } }, window.location.origin);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    const sizes = new ResizeObserver(schedule);
    sizes.observe(root);
    const mutations = new MutationObserver(schedule);
    mutations.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "style"] });
    const iframe = background.current;
    iframe?.addEventListener("load", schedule);
    window.addEventListener("resize", schedule);
    schedule();
    return () => { sizes.disconnect(); mutations.disconnect(); cancelAnimationFrame(frame); iframe?.removeEventListener("load", schedule); window.removeEventListener("resize", schedule); };
  }, [stageRef]);
  return <iframe ref={background} className="villa-stark-background" title="Villa Stark — fond animé" src={`/showcases/villa-stark/index.html?mode=background&channel=${channel}`} sandbox="allow-scripts allow-same-origin" />;
}

export function VillaStarkTools({ channel }) {
  const bus = useRef(null);
  useEffect(() => { const connection = new BroadcastChannel(`villa-stark:${channel}`); bus.current = connection; return () => { connection.close(); bus.current = null; }; }, [channel]);
  const send = (action, value) => bus.current?.postMessage({ type: "command", action, value });
  return <div className="villa-stark-tools">
    <span>Villa Stark · simulation</span>
    <div className="stark-themes">{[["aurum", "Sombre"], ["glacier", "Clair"], ["carbone", "Verre"]].map(([id, label]) => <button key={id} onClick={() => send("theme", id)}>{label}</button>)}</div>
    <button onClick={() => send("visitor")}>Visiteur au portail</button>
    <button onClick={() => send("intrusion")}>Intrusion terrasse</button>
    <button onClick={() => send("exterior")}>Vue extérieure</button>
    <button onClick={() => send("reset")}>Réinitialiser</button>
  </div>;
}
