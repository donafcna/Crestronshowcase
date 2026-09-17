import { devices } from '../data/projects.js';

// Le mode mobile ne crée aucun support qui ne soit déclaré dans le catalogue.
export function supportsDemoDevice(project, deviceType) {
  if (!['phone', 'tablet'].includes(deviceType)) return false;
  if (!project?.devices?.some(id => devices.find(d => d.id === id)?.simulatorType === deviceType)) return false;
  return project.isInteractive === true || Boolean(deviceType === 'phone' ? project.embedPhoneUrl : project.embedUrl);
}

export function nextDemoDevice(project, current) {
  const next = current === 'phone' ? 'tablet' : 'phone';
  return supportsDemoDevice(project, next) ? next : current;
}
