import { useEffect, useRef } from "react";

// Each Showcase owns a channel: two open projects cannot exchange commands.
export function VillaStarkBackground({ channel, projectId = "villa-stark" }) {
  return <iframe className="villa-stark-background" title={`${projectId === "my-jewel" ? "M/Y Jewel" : "Villa Stark"} — fond animé`} src={`/showcases/${projectId}/index.html?mode=background&channel=${channel}`} sandbox="allow-scripts allow-same-origin" />;
}

export function VillaStarkTools({ channel, projectId = "villa-stark" }) {
  const bus = useRef(null);
  useEffect(() => { const connection = new BroadcastChannel(`${projectId}:${channel}`); bus.current = connection; return () => { connection.close(); bus.current = null; }; }, [channel, projectId]);
  const send = (action, value) => bus.current?.postMessage({ type: "command", action, value });
  return <div className="villa-stark-tools">
    <span data-jewel={projectId === "my-jewel" ? "true" : undefined}>{projectId === "my-jewel" ? "M/Y Jewel" : "Villa Stark"} · simulation</span>
    <div className="stark-themes">{[["aurum", "Sombre"], ["glacier", "Clair"], ["carbone", "Verre"]].map(([id, label]) => <button key={id} onClick={() => send("theme", id)}>{label}</button>)}</div>
    <button onClick={() => send("exterior")}>Vue extérieure</button>
    <button onClick={() => send("reset")}>Réinitialiser</button>
  </div>;
}
