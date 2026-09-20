import React from 'react';
import { LuxuryControl } from './LuxuryControl';
// Keep the established component name and URL; present the VCA concept.
export function BoutiqueHermes(props) {
  return React.createElement(LuxuryControl, { ...props, projectId: 'boutique-hermes' });
}
export default BoutiqueHermes;
