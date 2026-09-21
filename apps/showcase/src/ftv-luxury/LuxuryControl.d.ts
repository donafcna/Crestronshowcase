import type { ComponentType } from 'react';
export interface LuxuryControlEvent { projectId: string; name: string; value: unknown; scope: string; }
export interface LuxuryControlProps { projectId: 'boutique-hermes' | 'yacht-monaco'; deviceType?: string; background3D?: boolean; onControl?: (detail: LuxuryControlEvent) => void; }
export declare const LuxuryControl: ComponentType<LuxuryControlProps>;
