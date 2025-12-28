export type IncidentType = 
  | 'accident' 
  | 'medical' 
  | 'fire' 
  | 'infrastructure' 
  | 'safety';

export type IncidentStatus = 
  | 'unverified' 
  | 'verified' 
  | 'in-progress' 
  | 'resolved';

export type SeverityLevel = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'critical';

export interface Incident {
  id: string;
  type: IncidentType;
  description: string;
  latitude: number;
  longitude: number;
  status: IncidentStatus;
  severity: SeverityLevel;
  confirmations: number;
  createdAt: string;
  updatedAt: string;
  reporterName?: string;
  mediaUrl?: string;
  notes?: string[];
  priorityScore: number;
  isFalseReport?: boolean;
}

export interface IncidentFormData {
  type: IncidentType;
  description: string;
  latitude: string;
  longitude: string;
  reporterName?: string;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'responder' | 'citizen';
  name: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface DashboardStats {
  totalIncidents: number;
  activeIncidents: number;
  highSeverityAlerts: number;
  resolvedIncidents: number;
  incidentsByType: Record<IncidentType, number>;
  incidentsTrend: { date: string; count: number }[];
  severityDistribution: Record<SeverityLevel, number>;
}
