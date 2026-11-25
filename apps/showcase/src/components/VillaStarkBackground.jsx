import { useEffect, useRef } from "react";

// Each Showcase owns a channel: two open projects cannot exchange commands.
export function VillaStarkBackground({ channel }) {
  return <iframe className="villa-stark-background" title="Villa Stark — fond animé" src={`/showcases/villa-stark/index.html?mode=background&channel=${channel}`} sandbox="allow-scripts allow-same-origin" />;
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
