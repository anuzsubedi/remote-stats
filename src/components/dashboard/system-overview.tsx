import { useMonitoringStore } from '@/stores/monitoring-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatBytes, formatPercentage, formatTemperature, formatFrequency, formatUptime } from '@/utils/formatters';
import { Cpu, MemoryStick, HardDrive, Thermometer, Activity } from 'lucide-react';

export function SystemOverview() {
  const {
    cpuUsage,
    memoryUsage,
    storageUsage,
    cpuInfo,
    memoryInfo,
    systemInfo,
    gpuInfo,
    isConnected,
    error,
  } = useMonitoringStore();

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Connection Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Get temperature readings
  const getTemperatureReadings = () => {
    const readings = [];
    
    // CPU Temperature
    if (cpuInfo && cpuInfo.temperature > 0) {
      readings.push({
        label: 'CPU',
        temperature: cpuInfo.temperature,
        icon: 'cpu'
      });
    }
    
    // GPU Temperatures
    if (gpuInfo?.nvidia) {
      gpuInfo.nvidia.forEach((gpu, index) => {
        if (gpu.temperature > 0) {
          readings.push({
            label: `GPU ${index + 1}`,
            temperature: gpu.temperature,
            icon: 'gpu'
          });
        }
      });
    }
    
    if (gpuInfo?.amd) {
      gpuInfo.amd.forEach((gpu, index) => {
        if (gpu.temperature > 0) {
          readings.push({
            label: `GPU ${index + 1}`,
            temperature: gpu.temperature,
            icon: 'gpu'
          });
        }
      });
    }
    
    // Raspberry Pi GPU Temperature
    if (gpuInfo?.raspberry_pi?.available && gpuInfo.raspberry_pi.temperature) {
      const tempMatch = gpuInfo.raspberry_pi.temperature.match(/temp=([\d.]+)/);
      if (tempMatch) {
        readings.push({
          label: 'GPU',
          temperature: parseFloat(tempMatch[1]),
          icon: 'gpu'
        });
      }
    }
    
    return readings;
  };

  const temperatureReadings = getTemperatureReadings();
  const maxTemperature = temperatureReadings.length > 0 ? Math.max(...temperatureReadings.map(r => r.temperature)) : 0;

  return (
    <div className="space-y-4">
      {/* System Information */}
      {systemInfo && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Information</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
              {/* Basic System Info */}
              <div>
                <div className="font-medium text-muted-foreground">Hostname</div>
                <div className="font-semibold">{systemInfo.hostname}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Platform</div>
                <div className="font-semibold">{systemInfo.platform} {systemInfo.architecture}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Kernel</div>
                <div className="font-semibold">{systemInfo.platform_release}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Uptime</div>
                <div className="font-semibold">{formatUptime(systemInfo.uptime)}</div>
              </div>

              {/* CPU Information */}
              <div>
                <div className="font-medium text-muted-foreground">CPU Type</div>
                <div className="font-semibold">{systemInfo.processor}</div>
                <div className="text-xs text-muted-foreground">
                  {systemInfo.architecture}
                </div>
              </div>
              {cpuInfo && (
                <div>
                  <div className="font-medium text-muted-foreground">CPU Cores</div>
                  <div className="font-semibold">{cpuInfo.total_cores} cores</div>
                  <div className="text-xs text-muted-foreground">
                    {cpuInfo.physical_cores} physical
                  </div>
                </div>
              )}

              {/* Memory Information */}
              {memoryInfo && (
                <div>
                  <div className="font-medium text-muted-foreground">Total Memory</div>
                  <div className="font-semibold">{formatBytes(memoryInfo.total)}</div>
                  <div className="text-xs text-muted-foreground">
                    {memoryInfo.swap.total > 0 ? `+${formatBytes(memoryInfo.swap.total)} swap` : 'No swap'}
                  </div>
                </div>
              )}

              {/* Storage Information */}
              {storageUsage && (
                <div>
                  <div className="font-medium text-muted-foreground">Total Storage</div>
                  <div className="font-semibold">{formatBytes(storageUsage.total_space)}</div>
                  <div className="text-xs text-muted-foreground">
                    {storageUsage.partitions_count} partition{storageUsage.partitions_count !== 1 ? 's' : ''}
                  </div>
                </div>
              )}

              {/* GPU Information */}
              {gpuInfo && (
                <div>
                  <div className="font-medium text-muted-foreground">Graphics</div>
                  {(() => {
                    const gpuTypes = [];
                    
                    if (gpuInfo.nvidia && gpuInfo.nvidia.length > 0) {
                      gpuTypes.push(`${gpuInfo.nvidia.length} NVIDIA`);
                    }
                    if (gpuInfo.amd && gpuInfo.amd.length > 0) {
                      gpuTypes.push(`${gpuInfo.amd.length} AMD`);
                    }
                    if (gpuInfo.integrated && gpuInfo.integrated.length > 0) {
                      gpuTypes.push(`${gpuInfo.integrated.length} Integrated`);
                    }
                    if (gpuInfo.raspberry_pi && gpuInfo.raspberry_pi.available) {
                      gpuTypes.push('Pi GPU');
                    }

                    if (gpuTypes.length > 0) {
                      return (
                        <>
                          <div className="font-semibold">{gpuTypes.join(', ')}</div>
                          <div className="text-xs text-muted-foreground">
                            {gpuTypes.length > 1 ? 'Multiple GPUs' : 'GPU detected'}
                          </div>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <div className="font-semibold">No GPU</div>
                          <div className="text-xs text-muted-foreground">Not detected</div>
                        </>
                      );
                    }
                  })()}
                </div>
              )}

              {/* Python Version */}
              <div>
                <div className="font-medium text-muted-foreground">Python</div>
                <div className="font-semibold">{systemInfo.python_version}</div>
                <div className="text-xs text-muted-foreground">Runtime</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Temperature Overview */}
        {temperatureReadings.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temperature</CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {formatTemperature(maxTemperature)}
                  </span>
                  <Badge variant={maxTemperature < 60 ? 'secondary' : maxTemperature < 75 ? 'default' : 'destructive'}>
                    {maxTemperature < 60 ? 'Cool' : maxTemperature < 75 ? 'Warm' : 'Hot'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {temperatureReadings.slice(0, 2).map((reading, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-muted-foreground">
                      <span>{reading.label}:</span>
                      <span>{formatTemperature(reading.temperature)}</span>
                    </div>
                  ))}
                  {temperatureReadings.length > 2 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{temperatureReadings.length - 2} more sensors
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CPU Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {cpuUsage ? formatPercentage(cpuUsage.cpu_usage_percent) : '--'}
                </span>
                <Badge variant={!isConnected ? 'destructive' : 'default'}>
                  {isConnected ? 'Connected' : 'Offline'}
                </Badge>
              </div>
              <Progress 
                value={cpuUsage?.cpu_usage_percent || 0} 
                className="w-full" 
              />
              {cpuInfo && (
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
                  <div>Cores: {cpuInfo.total_cores}</div>
                  <div>Freq: {formatFrequency(cpuInfo.current_frequency)}</div>
                  <div>Max: {formatFrequency(cpuInfo.max_frequency)}</div>
                  <div>Physical: {cpuInfo.physical_cores}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {memoryUsage ? formatPercentage(memoryUsage.percent) : '--'}
                </span>
                {memoryUsage && (
                  <span className="text-sm text-muted-foreground">
                    {formatBytes(memoryUsage.used)} / {formatBytes(memoryUsage.total)}
                  </span>
                )}
              </div>
              <Progress 
                value={memoryUsage?.percent || 0} 
                className="w-full" 
              />
              {memoryInfo && (
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
                  <div>Available: {formatBytes(memoryInfo.available)}</div>
                  <div>Free: {formatBytes(memoryInfo.free)}</div>
                  {memoryInfo.swap.total > 0 && (
                    <>
                      <div>Swap: {formatPercentage(memoryInfo.swap.percent)}</div>
                      <div>{formatBytes(memoryInfo.swap.used)} / {formatBytes(memoryInfo.swap.total)}</div>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Storage Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {storageUsage ? formatPercentage(storageUsage.usage_percent) : '--'}
                </span>
                {storageUsage && (
                  <span className="text-sm text-muted-foreground">
                    {formatBytes(storageUsage.used_space)} / {formatBytes(storageUsage.total_space)}
                  </span>
                )}
              </div>
              <Progress 
                value={storageUsage?.usage_percent || 0} 
                className="w-full" 
              />
              {storageUsage && (
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
                  <div>Free: {formatBytes(storageUsage.free_space)}</div>
                  <div>Partitions: {storageUsage.partitions_count}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 