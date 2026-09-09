import React, { createContext, useContext, useMemo, useState } from "react";

// Remonte les mesures du châssis (DeviceFrame) vers la page Showcase, qui
// affiche le bandeau de mesures Dev au-dessus de la barre des projets et la
// légende « support · taille · échelle » sur la ligne des outils de démo.
const FrameInfoContext = createContext(null);

export const FrameInfoProvider = ({ children }) => {
  const [info, setInfo] = useState(null);
  const value = useMemo(() => ({ info, setInfo }), [info]);
  return <FrameInfoContext.Provider value={value}>{children}</FrameInfoContext.Provider>;
};

// Hors provider : renvoie null (DeviceFrame affiche alors ses bandeaux lui-même).
export const useFrameInfo = () => useContext(FrameInfoContext);
