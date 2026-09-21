import React from 'react';
import { LuxuryControl } from './LuxuryControl';
export function YachtMonaco(props) {
  return React.createElement(LuxuryControl, { ...props, projectId: 'yacht-monaco' });
}
export default YachtMonaco;
