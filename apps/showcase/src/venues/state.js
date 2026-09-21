import { useEffect } from 'react';
export const VENUE_PROJECTS = { 'auditorium-richmond': 'conference', 'club-etoile': 'club' };
const snapshots = new Map();
export const readVenue = id => snapshots.get(id);
export function useVenueState(id, state) {
  const serialized = JSON.stringify(state);
  useEffect(() => {
    const value = JSON.parse(serialized);
    snapshots.set(id, value);
    window.dispatchEvent(new CustomEvent('ftv-venue-state', { detail: { id, state: value } }));
  }, [id, serialized]);
}
