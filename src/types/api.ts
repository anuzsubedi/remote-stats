// System Information Types
export interface SystemInfo {
  platform: string;
  platform_release: string;
  platform_version: string;
  architecture: string;
  processor: string;
  hostname: string;
  python_version: string;
  boot_time: number;
  uptime: number;
}

export interface CPUInfo {
  physical_cores: number;
  total_cores: number;
  max_frequency: number;
  current_frequency: number;
  min_frequency: number;
  cpu_usage_percent: number;
  cpu_usage_per_core: number[];
  temperature: number;
  cpu_times: {
    user: number;
    system: number;
    idle: number;
    nice: number;
    iowait: number;
    irq: number;
    softirq: number;
    steal: number;
    guest: number;
    guest_nice: number;
  };
  cpu_stats: {
    ctx_switches: number;
    interrupts: number;
    soft_interrupts: number;
    syscalls: number;
  };
}

export interface MemoryInfo {
  total: number;
  available: number;
  used: number;
  free: number;
  percent: number;
  swap: {
    total: number;
    used: number;
    free: number;
    percent: number;
  };
}

export interface DiskPartition {
  mountpoint: string;
  filesystem: string;
  total: number;
  used: number;
  free: number;
  percent: number;
}

export interface StorageInfo {
  partitions: Record<string, DiskPartition>;
  io_counters: {
    read_count: number;
    write_count: number;
    read_bytes: number;
    write_bytes: number;
    read_time: number;
    write_time: number;
  };
}

export interface NetworkInterface {
  addresses: Array<{
    family: string;
    address: string;
    netmask?: string;
    broadcast?: string;
    ptp?: string;
  }>;
  stats: {
    isup: boolean;
    duplex: number;
    speed: number;
    mtu: number;
  };
}

export interface NetworkInfo {
  interfaces: Record<string, NetworkInterface>;
  io_counters: {
    bytes_sent: number;
    bytes_recv: number;
    packets_sent: number;
    packets_recv: number;
    errin: number;
    errout: number;
    dropin: number;
    dropout: number;
  };
}

export interface ProcessInfo {
  pid: number;
  name: string;
  username: string;
  cpu_percent: number;
  memory_percent: number;
  status: string;
  create_time: number;
  memory_info: {
    rss: number;
    vms: number;
    percent: number;
  };
  cpu_info: {
    percent: number;
    num_threads: number;
  };
  connections?: Array<{
    fd: number;
    family: string;
    type: string;
    laddr: string;
    raddr?: string;
    status: string;
  }>;
  open_files?: Array<{
    path: string;
    fd: number;
  }>;
  threads?: Array<{
    id: number;
    user_time: number;
    system_time: number;
  }>;
}

export interface GPUInfo {
  nvidia: Array<{
    name: string;
    memory_total: number;
    memory_used: number;
    memory_free: number;
    temperature: number;
    utilization: number;
  }>;
  amd: Array<{
    id: string;
    name: string;
    memory_total: number;
    memory_used: number;
    memory_free: number;
    temperature: number;
    utilization: number;
  }>;
  integrated: Array<{
    name: string;
    type: string;
    usage_percent: string;
    source: string;
  }>;
  raspberry_pi: {
    available: boolean;
    gpu_memory: string;
    type: string;
    temperature: string;
    frequency: string;
  };
  general: Record<string, unknown>;
  opengl: string;
}

export interface APIResponse<T> {
  data?: T;
  timestamp: string;
}

export interface HealthStatus {
  status: string;
  message: string;
}

export interface APIInfo {
  name: string;
  version: string;
  endpoints: Record<string, string>;
}

// Usage-specific types
export interface CPUUsage {
  cpu_usage_percent: number;
  cpu_usage_per_core: number[];
  timestamp: string;
}

export interface MemoryUsage {
  total: number;
  used: number;
  free: number;
  percent: number;
  timestamp: string;
}

export interface StorageUsage {
  total_space: number;
  used_space: number;
  free_space: number;
  usage_percent: number;
  partitions_count: number;
  timestamp: string;
}

export interface ProcessesResponse {
  processes: ProcessInfo[];
  count: number;
  timestamp: string;
}

export interface TopProcessesResponse {
  top_cpu: ProcessInfo[];
  top_memory: ProcessInfo[];
  timestamp: string;
}

export interface NetworkConnection {
  fd: number;
  family: string;
  type: string;
  laddr: string;
  raddr?: string;
  status: string;
  pid?: number;
}

export interface NetworkConnectionsResponse {
  connections: NetworkConnection[];
  count: number;
  timestamp: string;
} 