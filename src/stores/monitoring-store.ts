import { create } from 'zustand';
import { apiService } from '@/services/api';
import type {
  SystemInfo,
  CPUInfo,
  MemoryInfo,
  StorageInfo,
  NetworkInfo,
  ProcessInfo,
  GPUInfo,
  HealthStatus,
  CPUUsage,
  MemoryUsage,
  StorageUsage,
  TopProcessesResponse,
  NetworkConnectionsResponse,
} from '@/types/api';

interface MonitoringState {
  // Connection status
  isConnected: boolean;
  lastUpdate: string | null;
  error: string | null;

  // System data
  systemInfo: SystemInfo | null;
  cpuInfo: CPUInfo | null;
  memoryInfo: MemoryInfo | null;
  storageInfo: StorageInfo | null;
  networkInfo: NetworkInfo | null;
  gpuInfo: GPUInfo | null;
  
  // Real-time usage data
  cpuUsage: CPUUsage | null;
  memoryUsage: MemoryUsage | null;
  storageUsage: StorageUsage | null;
  
  // Process data
  topProcesses: TopProcessesResponse | null;
  allProcesses: ProcessInfo[] | null;
  
  // Network connections
  networkConnections: NetworkConnectionsResponse | null;
  
  // Health status
  healthStatus: HealthStatus | null;
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  fetchAllData: () => Promise<void>;
  fetchSystemOverview: () => Promise<void>;
  fetchProcesses: () => Promise<void>;
  fetchNetworkConnections: () => Promise<void>;
  searchProcesses: (query: string) => Promise<ProcessInfo[]>;
  startRealTimeUpdates: () => void;
  stopRealTimeUpdates: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Polling intervals (in milliseconds)
const QUICK_POLL_INTERVAL = 2000; // 2 seconds for CPU, memory usage
const STANDARD_POLL_INTERVAL = 5000; // 5 seconds for most data
const SLOW_POLL_INTERVAL = 10000; // 10 seconds for static data

let quickPollTimer: NodeJS.Timeout | null = null;
let standardPollTimer: NodeJS.Timeout | null = null;
let slowPollTimer: NodeJS.Timeout | null = null;

export const useMonitoringStore = create<MonitoringState>((set, get) => ({
  // Initial state
  isConnected: false,
  lastUpdate: null,
  error: null,
  systemInfo: null,
  cpuInfo: null,
  memoryInfo: null,
  storageInfo: null,
  networkInfo: null,
  gpuInfo: null,
  cpuUsage: null,
  memoryUsage: null,
  storageUsage: null,
  topProcesses: null,
  allProcesses: null,
  networkConnections: null,
  healthStatus: null,
  isLoading: false,

  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),

  fetchAllData: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Fetch all data in parallel for initial load
      const [
        systemData,
        topProcesses,
        networkConnections,
        healthStatus,
      ] = await Promise.all([
        apiService.getAllSystemInfo(),
        apiService.getTopProcesses(10),
        apiService.getNetworkConnections(),
        apiService.getHealth(),
      ]);

      set({
        systemInfo: systemData.system,
        cpuInfo: systemData.cpu,
        memoryInfo: systemData.memory,
        storageInfo: systemData.disk,
        networkInfo: systemData.network,
        gpuInfo: systemData.gpu,
        topProcesses,
        networkConnections,
        healthStatus,
        isConnected: true,
        lastUpdate: new Date().toISOString(),
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch all data:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch data',
        isConnected: false,
        isLoading: false,
      });
    }
  },

  fetchSystemOverview: async () => {
    try {
      const [cpuUsage, memoryUsage, storageUsage] = await Promise.all([
        apiService.getCpuUsage(),
        apiService.getMemoryUsage(),
        apiService.getStorageUsage(),
      ]);

      set({
        cpuUsage,
        memoryUsage,
        storageUsage,
        lastUpdate: new Date().toISOString(),
        isConnected: true,
        error: null,
      });
    } catch (error) {
      console.error('Failed to fetch system overview:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch system overview',
        isConnected: false,
      });
    }
  },

  fetchProcesses: async () => {
    try {
      const topProcesses = await apiService.getTopProcesses(10);
      set({
        topProcesses,
        lastUpdate: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to fetch processes:', error);
    }
  },

  fetchNetworkConnections: async () => {
    try {
      const networkConnections = await apiService.getNetworkConnections();
      set({
        networkConnections,
        lastUpdate: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to fetch network connections:', error);
    }
  },

  searchProcesses: async (query: string): Promise<ProcessInfo[]> => {
    try {
      const result = await apiService.searchProcesses(query);
      return result.processes;
    } catch (error) {
      console.error('Failed to search processes:', error);
      return [];
    }
  },

  startRealTimeUpdates: () => {
    const state = get();
    
    // Stop any existing timers
    state.stopRealTimeUpdates();

    // Quick updates for CPU/Memory usage
    quickPollTimer = setInterval(() => {
      state.fetchSystemOverview();
    }, QUICK_POLL_INTERVAL);

    // Standard updates for processes and dynamic data
    standardPollTimer = setInterval(() => {
      state.fetchProcesses();
      state.fetchNetworkConnections();
    }, STANDARD_POLL_INTERVAL);

    // Slow updates for static system information
    slowPollTimer = setInterval(() => {
      state.fetchAllData();
    }, SLOW_POLL_INTERVAL);

    // Initial fetch
    state.fetchAllData();
  },

  stopRealTimeUpdates: () => {
    if (quickPollTimer) {
      clearInterval(quickPollTimer);
      quickPollTimer = null;
    }
    if (standardPollTimer) {
      clearInterval(standardPollTimer);
      standardPollTimer = null;
    }
    if (slowPollTimer) {
      clearInterval(slowPollTimer);
      slowPollTimer = null;
    }
  },
})); 