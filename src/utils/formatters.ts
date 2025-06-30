/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format frequency to human readable format
 */
export function formatFrequency(frequency: number): string {
  if (frequency >= 1e9) {
    return (frequency / 1e9).toFixed(2) + ' GHz';
  } else if (frequency >= 1e6) {
    return (frequency / 1e6).toFixed(0) + ' MHz';
  } else if (frequency >= 1e3) {
    return (frequency / 1e3).toFixed(0) + ' kHz';
  } else {
    return frequency.toFixed(0) + ' Hz';
  }
}

/**
 * Format temperature
 */
export function formatTemperature(temp: number): string {
  return `${temp.toFixed(1)}°C`;
}

/**
 * Format percentage
 */
export function formatPercentage(percent: number, decimals = 1): string {
  return `${percent.toFixed(decimals)}%`;
}

/**
 * Format uptime in human readable format
 */
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Format timestamp to relative time
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  } else if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffSeconds / 86400);
    return `${days}d ago`;
  }
}

/**
 * Format process status with appropriate styling
 */
export function getProcessStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status.toLowerCase()) {
    case 'running':
      return 'default';
    case 'sleeping':
    case 'idle':
      return 'secondary';
    case 'stopped':
    case 'zombie':
      return 'destructive';
    default:
      return 'outline';
  }
}

/**
 * Get color variant based on percentage value
 */
export function getPercentageVariant(percent: number): 'default' | 'secondary' | 'destructive' {
  if (percent < 50) return 'secondary';
  if (percent < 80) return 'default';
  return 'destructive';
}

/**
 * Format network address for display
 */
export function formatNetworkAddress(address: string, netmask?: string): string {
  if (netmask && address !== '127.0.0.1') {
    // Convert netmask to CIDR notation for non-localhost addresses
    const cidr = netmaskToCidr(netmask);
    return cidr ? `${address}/${cidr}` : address;
  }
  return address;
}

/**
 * Convert netmask to CIDR notation
 */
function netmaskToCidr(netmask: string): number | null {
  const netmaskMap: Record<string, number> = {
    '255.255.255.255': 32,
    '255.255.255.254': 31,
    '255.255.255.252': 30,
    '255.255.255.248': 29,
    '255.255.255.240': 28,
    '255.255.255.224': 27,
    '255.255.255.192': 26,
    '255.255.255.128': 25,
    '255.255.255.0': 24,
    '255.255.254.0': 23,
    '255.255.252.0': 22,
    '255.255.248.0': 21,
    '255.255.240.0': 20,
    '255.255.224.0': 19,
    '255.255.192.0': 18,
    '255.255.128.0': 17,
    '255.255.0.0': 16,
    '255.254.0.0': 15,
    '255.252.0.0': 14,
    '255.248.0.0': 13,
    '255.240.0.0': 12,
    '255.224.0.0': 11,
    '255.192.0.0': 10,
    '255.128.0.0': 9,
    '255.0.0.0': 8,
  };
  
  return netmaskMap[netmask] || null;
} 