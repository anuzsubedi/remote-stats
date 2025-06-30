import { useMonitoringStore } from '@/stores/monitoring-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatFrequency, formatTemperature, formatPercentage } from '@/utils/formatters';
import { Cpu, Thermometer, Zap, Activity, Clock } from 'lucide-react';

export function CpuMonitor() {
  const { cpuInfo, cpuUsage, systemInfo } = useMonitoringStore();

  if (!cpuInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">CPU Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {/* CPU Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">CPU Overview</CardTitle>
          <Cpu className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* CPU Usage */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Usage</span>
              </div>
              <div className="text-3xl font-bold">
                {cpuUsage ? formatPercentage(cpuUsage.cpu_usage_percent) : '--'}
              </div>
              <Progress value={cpuUsage?.cpu_usage_percent || 0} className="mt-2" />
            </div>

            {/* Frequency */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Frequency</span>
              </div>
              <div className="text-3xl font-bold">{formatFrequency(cpuInfo.current_frequency)}</div>
              <div className="text-xs text-muted-foreground">
                Max: {formatFrequency(cpuInfo.max_frequency)}
              </div>
            </div>

            {/* Temperature */}
            {cpuInfo.temperature > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Temperature</span>
                </div>
                <div className="text-3xl font-bold">{formatTemperature(cpuInfo.temperature)}</div>
                <Badge variant={cpuInfo.temperature < 65 ? 'secondary' : cpuInfo.temperature < 80 ? 'default' : 'destructive'}>
                  {cpuInfo.temperature < 65 ? 'Cool' : cpuInfo.temperature < 80 ? 'Warm' : 'Hot'}
                </Badge>
              </div>
            )}

            {/* Load Average */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Cores</span>
              </div>
              <div className="text-3xl font-bold">{cpuInfo.total_cores}</div>
              <div className="text-xs text-muted-foreground">
                {cpuInfo.physical_cores} physical
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CPU Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">CPU Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-muted-foreground">Processor</div>
              <div className="font-semibold">{systemInfo?.processor || 'Unknown'}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Architecture</div>
              <div className="font-semibold">{systemInfo?.architecture || 'Unknown'}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Total Cores</div>
              <div className="font-semibold">{cpuInfo.total_cores}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Physical Cores</div>
              <div className="font-semibold">{cpuInfo.physical_cores}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Min Frequency</div>
              <div className="font-semibold">{formatFrequency(cpuInfo.min_frequency)}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Max Frequency</div>
              <div className="font-semibold">{formatFrequency(cpuInfo.max_frequency)}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Current Frequency</div>
              <div className="font-semibold">{formatFrequency(cpuInfo.current_frequency)}</div>
            </div>
            {cpuInfo.temperature > 0 && (
              <div>
                <div className="font-medium text-muted-foreground">Temperature</div>
                <div className="font-semibold">{formatTemperature(cpuInfo.temperature)}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Per-Core Usage */}
      {cpuUsage && cpuUsage.cpu_usage_per_core && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Per-Core Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {cpuUsage.cpu_usage_per_core.map((usage, index) => (
                <div key={index} className="text-center">
                  <div className="text-sm font-medium mb-1">Core {index + 1}</div>
                  <div className="text-lg font-bold mb-2">{formatPercentage(usage)}</div>
                  <Progress value={usage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CPU Times */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">CPU Time Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <div className="font-medium text-muted-foreground">User Time</div>
              <div className="font-semibold">{cpuInfo.cpu_times.user.toFixed(2)}s</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">System Time</div>
              <div className="font-semibold">{cpuInfo.cpu_times.system.toFixed(2)}s</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Idle Time</div>
              <div className="font-semibold">{cpuInfo.cpu_times.idle.toFixed(2)}s</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">I/O Wait</div>
              <div className="font-semibold">{cpuInfo.cpu_times.iowait.toFixed(2)}s</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">IRQ Time</div>
              <div className="font-semibold">{(cpuInfo.cpu_times.irq + cpuInfo.cpu_times.softirq).toFixed(2)}s</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CPU Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">System Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-muted-foreground">Context Switches</div>
              <div className="font-semibold">{cpuInfo.cpu_stats.ctx_switches.toLocaleString()}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Interrupts</div>
              <div className="font-semibold">{cpuInfo.cpu_stats.interrupts.toLocaleString()}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Soft Interrupts</div>
              <div className="font-semibold">{cpuInfo.cpu_stats.soft_interrupts.toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 