import { Incident, IncidentType, IncidentStatus, SeverityLevel } from '@/types/incident';

const incidentTypes: IncidentType[] = ['accident', 'medical', 'fire', 'infrastructure', 'safety'];
const statuses: IncidentStatus[] = ['unverified', 'verified', 'in-progress', 'resolved'];
const severities: SeverityLevel[] = ['low', 'medium', 'high', 'critical'];

const descriptions: Record<IncidentType, string[]> = {
  accident: [
    'Vehicle collision at intersection',
    'Multi-car pileup on highway',
    'Pedestrian struck by vehicle',
    'Motorcycle accident near school zone',
    'Bus and truck collision',
  ],
  medical: [
    'Person collapsed in shopping center',
    'Cardiac emergency at office building',
    'Severe allergic reaction reported',
    'Individual in respiratory distress',
    'Unconscious person found in park',
  ],
  fire: [
    'Building fire reported',
    'Smoke emanating from residential area',
    'Kitchen fire in restaurant',
    'Electrical fire in commercial building',
    'Wildfire approaching residential zone',
  ],
  infrastructure: [
    'Water main break flooding street',
    'Power line down across road',
    'Sinkhole forming in parking lot',
    'Bridge structural damage reported',
    'Gas leak detected in neighborhood',
  ],
  safety: [
    'Suspicious activity reported',
    'Armed individual spotted near school',
    'Public disturbance in downtown area',
    'Chemical spill on highway',
    'Hazardous material found in public area',
  ],
};

const typeWeights: Record<IncidentType, number> = {
  accident: 3,
  medical: 4,
  fire: 5,
  infrastructure: 2,
  safety: 4,
};

export const calculatePriorityScore = (
  type: IncidentType,
  severity: SeverityLevel,
  confirmations: number
): number => {
  const severityWeights: Record<SeverityLevel, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 5,
  };

  const baseScore = typeWeights[type] * severityWeights[severity];
  const confirmationBonus = Math.min(confirmations * 0.5, 5);
  return Math.round((baseScore + confirmationBonus) * 10) / 10;
};

export const generateMockIncident = (id: number): Incident => {
  const type = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const severity = severities[Math.floor(Math.random() * severities.length)];
  const confirmations = Math.floor(Math.random() * 20);
  const descList = descriptions[type];
  const description = descList[Math.floor(Math.random() * descList.length)];

  // Generate coordinates around a city (example: San Francisco area)
  const baseLat = 37.7749;
  const baseLng = -122.4194;
  const latitude = baseLat + (Math.random() - 0.5) * 0.1;
  const longitude = baseLng + (Math.random() - 0.5) * 0.1;

  const createdAt = new Date(
    Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
  ).toISOString();

  return {
    id: `INC-${String(id).padStart(6, '0')}`,
    type,
    description,
    latitude,
    longitude,
    status,
    severity,
    confirmations,
    createdAt,
    updatedAt: createdAt,
    priorityScore: calculatePriorityScore(type, severity, confirmations),
    notes: status !== 'unverified' 
      ? ['Initial assessment completed', 'Resources dispatched'] 
      : undefined,
  };
};

export const generateMockIncidents = (count: number): Incident[] => {
  return Array.from({ length: count }, (_, i) => generateMockIncident(i + 1))
    .sort((a, b) => b.priorityScore - a.priorityScore);
};

export const mockIncidents = generateMockIncidents(25);

export const mockUsers = [
  { 
    id: '1', 
    username: 'admin', 
    password: 'admin@123', 
    role: 'admin' as const, 
    name: 'System Administrator' 
  },
  { 
    id: '2', 
    username: 'responder', 
    password: 'resp@123', 
    role: 'responder' as const, 
    name: 'First Responder' 
  },
];
