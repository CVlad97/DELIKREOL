// DELIKREOL — Estimation de délai réaliste
// Formule : ETA = prep + driver_delay + travel_time + safety_margin

export interface ETAEstimate {
  min: number;
  max: number;
  unit: 'min';
  level: 'precise' | 'estimated' | 'to_confirm';
  message: string;
}

const PEAK_MORNING = { start: 7, end: 9 };    // 07:00-09:00
const PEAK_LUNCH = { start: 11.5, end: 13.5 }; // 11:30-13:30
const PEAK_EVENING = { start: 18.5, end: 21 }; // 18:30-21:00

function isPeakHour(): boolean {
  const h = new Date().getHours() + new Date().getMinutes() / 60;
  const isWeekend = [0, 6].includes(new Date().getDay());
  if (isWeekend) return true;
  return (
    (h >= PEAK_MORNING.start && h <= PEAK_MORNING.end) ||
    (h >= PEAK_LUNCH.start && h <= PEAK_LUNCH.end) ||
    (h >= PEAK_EVENING.start && h <= PEAK_EVENING.end)
  );
}

export function estimateETA(params: {
  prepMinutes: number;
  driverAvailable: boolean;
  distanceKm: number;
  isRelay: boolean;
}): ETAEstimate {
  const peakMultiplier = isPeakHour() ? 1.3 : 1;
  const avgSpeed = params.isRelay ? 25 : 30; // km/h en ville

  const travelMin = (params.distanceKm / avgSpeed) * 60 * peakMultiplier;
  const driverDelay = params.driverAvailable ? 0 : 15;
  const safetyMargin = 10;

  const etaMin = Math.round((params.prepMinutes + driverDelay + travelMin + safetyMargin) * 0.85);
  const etaMax = Math.round((params.prepMinutes + driverDelay + travelMin + safetyMargin) * 1.15);

  return {
    min: etaMin,
    max: etaMax,
    unit: 'min',
    level: params.driverAvailable && params.prepMinutes > 0 ? 'estimated' : 'to_confirm',
    message: params.driverAvailable
      ? `Estimation : ${etaMin}–${etaMax} min`
      : 'Créneau à confirmer avec le partenaire',
  };
}

export function formatETA(eta: ETAEstimate): string {
  return eta.message;
}