import type {
  SystemInfo,
  CPUInfo,
  MemoryInfo,
  StorageInfo,
  NetworkInfo,
  ProcessInfo,
  GPUInfo,
  HealthStatus,
  APIInfo,
  CPUUsage,
  MemoryUsage,
  StorageUsage,
  ProcessesResponse,
  TopProcessesResponse,
  NetworkConnectionsResponse,
  DiskPartition,
} from '@/types/api';

const API_BASE_URL = 'http://localhost:5000';

class ApiService {
  private async fetchApi<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}:`, error);
      throw error;
    }
  }

  // Health & Info endpoints
  async getHealth(): Promise<HealthStatus> {
    return this.fetchApi<HealthStatus>('/api/health');
  }

  async getApiInfo(): Promise<APIInfo> {
    return this.fetchApi<APIInfo>('/api');
  }

  // System Information endpoints
  async getAllSystemInfo(): Promise<{
    timestamp: string;
    system: SystemInfo;
    cpu: CPUInfo;
    memory: MemoryInfo;
    disk: StorageInfo;
    network: NetworkInfo;
    gpu: GPUInfo;
  }> {
    return this.fetchApi('/api/system/');
  }

  async getSystemGeneral(): Promise<SystemInfo> {
    return this.fetchApi<SystemInfo>('/api/system/general');
  }

  async getCpuInfo(): Promise<CPUInfo> {
    return this.fetchApi<CPUInfo>('/api/system/cpu');
  }

  async getMemoryInfo(): Promise<MemoryInfo> {
    return this.fetchApi<MemoryInfo>('/api/system/memory');
  }

  async getCpuUsage(): Promise<CPUUsage> {
    return this.fetchApi<CPUUsage>('/api/system/cpu/usage');
  }

  async getMemoryUsage(): Promise<MemoryUsage> {
    return this.fetchApi<MemoryUsage>('/api/system/memory/usage');
  }

  // Process endpoints
  async getAllProcesses(): Promise<ProcessesResponse> {
    return this.fetchApi<ProcessesResponse>('/api/processes/');
  }

  async getTopProcesses(limit = 10): Promise<TopProcessesResponse> {
    return this.fetchApi<TopProcessesResponse>(`/api/processes/top?limit=${limit}`);
  }

  async getProcess(pid: number): Promise<ProcessInfo> {
    return this.fetchApi<ProcessInfo>(`/api/processes/${pid}`);
  }

  async searchProcesses(query: string): Promise<ProcessesResponse & { query: string }> {
    return this.fetchApi(`/api/processes/search?q=${encodeURIComponent(query)}`);
  }

  // Storage endpoints
  async getAllStorageInfo(): Promise<StorageInfo> {
    return this.fetchApi<StorageInfo>('/api/storage/');
  }

  async getStoragePartitions(): Promise<{ partitions: Record<string, DiskPartition>; timestamp: string }> {
    return this.fetchApi('/api/storage/partitions');
  }

  async getStorageIO(): Promise<{
    io_counters: StorageInfo['io_counters'];
    timestamp: string;
  }> {
    return this.fetchApi('/api/storage/io');
  }

  async getStorageUsage(): Promise<StorageUsage> {
    return this.fetchApi<StorageUsage>('/api/storage/usage');
  }

  // Network endpoints
  async getAllNetworkInfo(): Promise<NetworkInfo> {
    return this.fetchApi<NetworkInfo>('/api/network/');
  }

  async getNetworkInterfaces(): Promise<{
    interfaces: Record<string, NetworkInfo['interfaces'][string]>;
    timestamp: string;
  }> {
    return this.fetchApi('/api/network/interfaces');
  }

  async getNetworkIO(): Promise<{
    io_counters: NetworkInfo['io_counters'];
    timestamp: string;
  }> {
    return this.fetchApi('/api/network/io');
  }

  async getNetworkConnections(): Promise<NetworkConnectionsResponse> {
    return this.fetchApi<NetworkConnectionsResponse>('/api/network/connections');
  }

  // GPU endpoints
  async getAllGpuInfo(): Promise<GPUInfo> {
    return this.fetchApi<GPUInfo>('/api/gpu/');
  }

  async getNvidiaGpuInfo(): Promise<{
    nvidia: GPUInfo['nvidia'];
    timestamp: string;
  }> {
    return this.fetchApi('/api/gpu/nvidia');
  }

  async getAmdGpuInfo(): Promise<{
    amd: GPUInfo['amd'];
    timestamp: string;
  }> {
    return this.fetchApi('/api/gpu/amd');
  }

  async getIntegratedGpuInfo(): Promise<{
    integrated: GPUInfo['integrated'];
    timestamp: string;
  }> {
    return this.fetchApi('/api/gpu/integrated');
  }

  async getRaspberryPiGpuInfo(): Promise<{
    raspberry_pi: GPUInfo['raspberry_pi'];
    timestamp: string;
  }> {
    return this.fetchApi('/api/gpu/raspberry-pi');
  }

  async getGeneralGpuInfo(): Promise<{
    general: GPUInfo['general'];
    timestamp: string;
  }> {
    return this.fetchApi('/api/gpu/general');
  }

  async getOpenGLInfo(): Promise<{
    opengl: string;
    timestamp: string;
  }> {
    return this.fetchApi('/api/gpu/opengl');
  }

  async getGpuMessages(): Promise<{
    messages: string[];
    summary: {
      nvidia_count: number;
      amd_count: number;
      integrated_count: number;
      raspberry_pi_available: boolean;
      opengl_available: boolean;
    };
    timestamp: string;
  }> {
    return this.fetchApi('/api/gpu/messages');
  }
}

export const apiService = new ApiService(); 