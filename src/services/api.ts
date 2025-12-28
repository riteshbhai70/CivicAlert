import axios from 'axios';
import { 
  Incident, 
  IncidentFormData, 
  DashboardStats, 
  User,
  IncidentType,
  SeverityLevel,
  IncidentStatus
} from '@/types/incident';
import { mockIncidents, mockUsers, calculatePriorityScore } from './mockData';

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory store for mock data
let incidents = [...mockIncidents];

// Create axios instance (for future backend integration)
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Incident API
export const incidentApi = {
  // Get all incidents with optional filters
  getAll: async (filters?: {
    type?: IncidentType;
    status?: IncidentStatus;
    severity?: SeverityLevel;
    startDate?: string;
    endDate?: string;
  }): Promise<Incident[]> => {
    await delay(300);
    
    let filtered = [...incidents];
    
    if (filters?.type) {
      filtered = filtered.filter(i => i.type === filters.type);
    }
    if (filters?.status) {
      filtered = filtered.filter(i => i.status === filters.status);
    }
    if (filters?.severity) {
      filtered = filtered.filter(i => i.severity === filters.severity);
    }
    if (filters?.startDate) {
      filtered = filtered.filter(i => new Date(i.createdAt) >= new Date(filters.startDate!));
    }
    if (filters?.endDate) {
      filtered = filtered.filter(i => new Date(i.createdAt) <= new Date(filters.endDate!));
    }
    
    return filtered.sort((a, b) => b.priorityScore - a.priorityScore);
  },

  // Get single incident by ID
  getById: async (id: string): Promise<Incident | undefined> => {
    await delay(200);
    return incidents.find(i => i.id === id);
  },

  // Create new incident
  create: async (data: IncidentFormData): Promise<Incident> => {
    await delay(500);
    
    const newId = incidents.length + 1;
    const newIncident: Incident = {
      id: `INC-${String(newId).padStart(6, '0')}`,
      type: data.type,
      description: data.description,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      status: 'unverified',
      severity: 'medium', // Default severity
      confirmations: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reporterName: data.reporterName,
      priorityScore: calculatePriorityScore(data.type, 'medium', 1),
    };
    
    incidents = [newIncident, ...incidents];
    return newIncident;
  },

  // Confirm/upvote incident
  confirm: async (id: string): Promise<Incident> => {
    await delay(300);
    
    const index = incidents.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Incident not found');
    
    const incident = incidents[index];
    incident.confirmations += 1;
    incident.priorityScore = calculatePriorityScore(
      incident.type, 
      incident.severity, 
      incident.confirmations
    );
    
    // Auto-verify after 3 confirmations
    if (incident.confirmations >= 3 && incident.status === 'unverified') {
      incident.status = 'verified';
    }
    
    incident.updatedAt = new Date().toISOString();
    incidents[index] = incident;
    
    return incident;
  },

  // Update incident status
  updateStatus: async (id: string, status: IncidentStatus): Promise<Incident> => {
    await delay(300);
    
    const index = incidents.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Incident not found');
    
    incidents[index].status = status;
    incidents[index].updatedAt = new Date().toISOString();
    
    return incidents[index];
  },

  // Update incident severity
  updateSeverity: async (id: string, severity: SeverityLevel): Promise<Incident> => {
    await delay(300);
    
    const index = incidents.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Incident not found');
    
    const incident = incidents[index];
    incident.severity = severity;
    incident.priorityScore = calculatePriorityScore(
      incident.type,
      severity,
      incident.confirmations
    );
    incident.updatedAt = new Date().toISOString();
    incidents[index] = incident;
    
    return incident;
  },

  // Add note to incident
  addNote: async (id: string, note: string): Promise<Incident> => {
    await delay(200);
    
    const index = incidents.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Incident not found');
    
    if (!incidents[index].notes) {
      incidents[index].notes = [];
    }
    incidents[index].notes!.push(`[${new Date().toLocaleString()}] ${note}`);
    incidents[index].updatedAt = new Date().toISOString();
    
    return incidents[index];
  },

  // Mark as false report
  markFalseReport: async (id: string): Promise<Incident> => {
    await delay(300);
    
    const index = incidents.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Incident not found');
    
    incidents[index].isFalseReport = true;
    incidents[index].status = 'resolved';
    incidents[index].updatedAt = new Date().toISOString();
    
    return incidents[index];
  },

  // Get dashboard statistics
  getStats: async (): Promise<DashboardStats> => {
    await delay(400);
    
    const activeStatuses: IncidentStatus[] = ['unverified', 'verified', 'in-progress'];
    
    const stats: DashboardStats = {
      totalIncidents: incidents.length,
      activeIncidents: incidents.filter(i => activeStatuses.includes(i.status)).length,
      highSeverityAlerts: incidents.filter(
        i => (i.severity === 'high' || i.severity === 'critical') && 
             activeStatuses.includes(i.status)
      ).length,
      resolvedIncidents: incidents.filter(i => i.status === 'resolved').length,
      incidentsByType: {
        accident: incidents.filter(i => i.type === 'accident').length,
        medical: incidents.filter(i => i.type === 'medical').length,
        fire: incidents.filter(i => i.type === 'fire').length,
        infrastructure: incidents.filter(i => i.type === 'infrastructure').length,
        safety: incidents.filter(i => i.type === 'safety').length,
      },
      incidentsTrend: generateTrendData(),
      severityDistribution: {
        low: incidents.filter(i => i.severity === 'low').length,
        medium: incidents.filter(i => i.severity === 'medium').length,
        high: incidents.filter(i => i.severity === 'high').length,
        critical: incidents.filter(i => i.severity === 'critical').length,
      },
    };
    
    return stats;
  },
};

// Generate trend data for the last 7 days
const generateTrendData = () => {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      count: Math.floor(Math.random() * 10) + 3,
    });
  }
  return data;
};

// Auth API
export const authApi = {
  login: async (username: string, password: string): Promise<User> => {
    await delay(500);
    
    const user = mockUsers.find(
      u => u.username === username && u.password === password
    );
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  logout: async (): Promise<void> => {
    await delay(200);
  },
};
