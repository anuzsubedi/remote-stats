import { useMonitoringStore } from '@/stores/monitoring-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatBytes, formatTemperature, formatPercentage } from '@/utils/formatters';
import { Monitor, Thermometer, Activity, MemoryStick, Clock, Info } from 'lucide-react';

export function GpuMonitor() {
  const { gpuInfo } = useMonitoringStore();

  // Detect GPU types
  const hasNvidiaGPU = gpuInfo?.nvidia && gpuInfo.nvidia.length > 0;
  const hasAmdGPU = gpuInfo?.amd && gpuInfo.amd.length > 0;
  const hasIntegratedGPU = gpuInfo?.integrated && gpuInfo.integrated.length > 0;
  const hasPiGPU = gpuInfo?.raspberry_pi?.available;

  const hasAnyGPU = hasNvidiaGPU || hasAmdGPU || hasIntegratedGPU || hasPiGPU;

  if (!hasAnyGPU) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">No GPUs Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">
              <Monitor className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No Graphics Hardware Found</p>
              <p className="text-sm">
                No GPU information is available or no compatible graphics hardware is installed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Build summary cards for only available GPU types
  const summaryCards = [];
  if (hasNvidiaGPU) {
    summaryCards.push(
      <div key="nvidia" className="rounded-xl border bg-gradient-to-br from-green-50 to-white p-6 flex flex-col items-center shadow-sm">
        <Monitor className="h-7 w-7 text-green-600 mb-2" />
        <div className="text-3xl font-bold text-green-700">{gpuInfo.nvidia.length}</div>
        <div className="text-sm text-muted-foreground">NVIDIA GPU{gpuInfo.nvidia.length > 1 ? 's' : ''}</div>
        <Badge variant="default" className="mt-2">NVIDIA</Badge>
      </div>
    );
  }
  if (hasAmdGPU) {
    summaryCards.push(
      <div key="amd" className="rounded-xl border bg-gradient-to-br from-red-50 to-white p-6 flex flex-col items-center shadow-sm">
        <Monitor className="h-7 w-7 text-red-600 mb-2" />
        <div className="text-3xl font-bold text-red-700">{gpuInfo.amd.length}</div>
        <div className="text-sm text-muted-foreground">AMD GPU{gpuInfo.amd.length > 1 ? 's' : ''}</div>
        <Badge variant="destructive" className="mt-2">AMD</Badge>
      </div>
    );
  }
  if (hasIntegratedGPU) {
    summaryCards.push(
      <div key="integrated" className="rounded-xl border bg-gradient-to-br from-blue-50 to-white p-6 flex flex-col items-center shadow-sm">
        <Monitor className="h-7 w-7 text-blue-600 mb-2" />
        <div className="text-3xl font-bold text-blue-700">{gpuInfo.integrated.length}</div>
        <div className="text-sm text-muted-foreground">Integrated GPU{gpuInfo.integrated.length > 1 ? 's' : ''}</div>
        <Badge variant="secondary" className="mt-2">Integrated</Badge>
      </div>
    );
  }
  if (hasPiGPU) {
    summaryCards.push(
      <div key="pi" className="rounded-xl border bg-gradient-to-br from-purple-50 to-white p-6 flex flex-col items-center shadow-sm">
        <Monitor className="h-7 w-7 text-purple-600 mb-2" />
        <div className="text-3xl font-bold text-purple-700">1</div>
        <div className="text-sm text-muted-foreground">Raspberry Pi GPU</div>
        <Badge variant="outline" className="mt-2">Pi</Badge>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* GPU Overview Summary - only available types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Graphics Hardware Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {summaryCards}
          </div>
        </CardContent>
      </Card>

      {/* NVIDIA GPUs */}
      {hasNvidiaGPU && gpuInfo.nvidia.map((gpu, index) => (
        <Card key={`nvidia-${index}`} className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-green-600" />
                <span className="font-semibold">NVIDIA GPU {index + 1}:</span> {gpu.name}
              </div>
              <Badge variant="default">NVIDIA</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Utilization */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="font-medium">GPU Utilization</span>
                </div>
                <div className="text-3xl font-bold">{formatPercentage(gpu.utilization)}</div>
                <Progress value={gpu.utilization} className="h-2" />
              </div>
              {/* Memory */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MemoryStick className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Memory Usage</span>
                </div>
                <div className="text-3xl font-bold">
                  {formatPercentage((gpu.memory_used / gpu.memory_total) * 100)}
                </div>
                <Progress value={(gpu.memory_used / gpu.memory_total) * 100} className="h-2" />
                <div className="text-sm text-muted-foreground">
                  {formatBytes(gpu.memory_used * 1024 * 1024)} / {formatBytes(gpu.memory_total * 1024 * 1024)}
                </div>
              </div>
              {/* Temperature */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Temperature</span>
                </div>
                <div className="text-3xl font-bold">{formatTemperature(gpu.temperature)}</div>
                <Badge variant={gpu.temperature < 65 ? 'secondary' : gpu.temperature < 80 ? 'default' : 'destructive'}>
                  {gpu.temperature < 65 ? 'Cool' : gpu.temperature < 80 ? 'Warm' : 'Hot'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* AMD GPUs */}
      {hasAmdGPU && gpuInfo.amd.map((gpu, index) => (
        <Card key={`amd-${index}`} className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-red-600" />
                <span className="font-semibold">AMD GPU {index + 1}:</span> {gpu.name}
              </div>
              <Badge variant="destructive">AMD</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Utilization */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-red-600" />
                  <span className="font-medium">GPU Utilization</span>
                </div>
                <div className="text-3xl font-bold">{formatPercentage(gpu.utilization)}</div>
                <Progress value={gpu.utilization} className="h-2" />
              </div>
              {/* Memory */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MemoryStick className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Memory Usage</span>
                </div>
                <div className="text-3xl font-bold">
                  {formatPercentage((gpu.memory_used / gpu.memory_total) * 100)}
                </div>
                <Progress value={(gpu.memory_used / gpu.memory_total) * 100} className="h-2" />
                <div className="text-sm text-muted-foreground">
                  {formatBytes(gpu.memory_used * 1024 * 1024)} / {formatBytes(gpu.memory_total * 1024 * 1024)}
                </div>
              </div>
              {/* Temperature */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Temperature</span>
                </div>
                <div className="text-3xl font-bold">{formatTemperature(gpu.temperature)}</div>
                <Badge variant={gpu.temperature < 70 ? 'secondary' : gpu.temperature < 85 ? 'default' : 'destructive'}>
                  {gpu.temperature < 70 ? 'Cool' : gpu.temperature < 85 ? 'Warm' : 'Hot'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Integrated GPUs */}
      {hasIntegratedGPU && gpuInfo.integrated.map((gpu, index) => (
        <Card key={`integrated-${index}`} className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Integrated GPU:</span> {gpu.name}
              </div>
              <Badge variant="secondary">Integrated</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Usage */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">GPU Usage</span>
                </div>
                <div className="text-3xl font-bold">{gpu.usage_percent}%</div>
                <Progress value={parseFloat(gpu.usage_percent)} className="h-2" />
                <div className="text-sm text-muted-foreground">Source: {gpu.source}</div>
              </div>
              {/* GPU Type */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">GPU Type</span>
                </div>
                <div className="text-lg font-semibold">{gpu.type}</div>
                <div className="text-sm text-muted-foreground">Integrated Graphics</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Raspberry Pi GPU */}
      {hasPiGPU && gpuInfo.raspberry_pi && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-purple-600" />
                <span className="font-semibold">Raspberry Pi GPU:</span> {gpuInfo.raspberry_pi.type}
              </div>
              <Badge variant="outline">Raspberry Pi</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* GPU Memory */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MemoryStick className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">GPU Memory</span>
                </div>
                <div className="text-2xl font-bold">{gpuInfo.raspberry_pi.gpu_memory}</div>
                <div className="text-sm text-muted-foreground">Dedicated to GPU</div>
              </div>
              {/* Frequency (parsed) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">GPU Frequency</span>
                </div>
                <div className="text-2xl font-bold">
                  {/* Parse and show only the gpu_freq value */}
                  {(() => {
                    const freqMatch = gpuInfo.raspberry_pi.frequency.match(/gpu_freq=([\d]+)/);
                    return freqMatch ? `${freqMatch[1]} MHz` : 'Unknown';
                  })()}
                </div>
                <div className="text-sm text-muted-foreground">Current frequency</div>
              </div>
              {/* Temperature */}
              {gpuInfo.raspberry_pi.temperature && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Temperature</span>
                  </div>
                  <div className="text-2xl font-bold">{gpuInfo.raspberry_pi.temperature}</div>
                  <div className="text-sm text-muted-foreground">Current temperature</div>
                </div>
              )}
            </div>
            {/* Collapsible Advanced Config */}
            {gpuInfo.raspberry_pi.frequency && (
              <details className="mt-6">
                <summary className="cursor-pointer font-medium text-purple-700">Advanced Pi GPU Config</summary>
                <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-x-auto border border-muted-foreground/10">
                  {gpuInfo.raspberry_pi.frequency}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 