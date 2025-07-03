"use client"

import { useMonitoringStore } from "@/stores/monitoring-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { formatFrequency, formatTemperature, formatPercentage } from "@/utils/formatters"
import { Cpu, Thermometer, Zap, Activity, Clock, Info, BarChart3 } from "lucide-react"

export function CpuMonitor() {
  const { cpuInfo, cpuUsage, systemInfo } = useMonitoringStore()

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
    )
  }

  return (
    <div className="space-y-6">
      {/* CPU Overview & Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            CPU Overview & Specifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* CPU Usage */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Usage</span>
              </div>
              <div className="text-3xl font-bold">{cpuUsage ? formatPercentage(cpuUsage.cpu_usage_percent) : "--"}</div>
              <Progress value={cpuUsage?.cpu_usage_percent || 0} className="h-2" />
            </div>

            {/* Frequency */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Frequency</span>
              </div>
              <div className="text-3xl font-bold">{formatFrequency(cpuInfo.current_frequency)}</div>
              <div className="text-xs text-muted-foreground">Max: {formatFrequency(cpuInfo.max_frequency)}</div>
            </div>

            {/* Temperature */}
            {cpuInfo.temperature > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Temperature</span>
                </div>
                <div className="text-3xl font-bold">{formatTemperature(cpuInfo.temperature)}</div>
                <Badge
                  variant={
                    cpuInfo.temperature < 65 ? "secondary" : cpuInfo.temperature < 80 ? "default" : "destructive"
                  }
                >
                  {cpuInfo.temperature < 65 ? "Cool" : cpuInfo.temperature < 80 ? "Warm" : "Hot"}
                </Badge>
              </div>
            )}

            {/* Cores */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Cores</span>
              </div>
              <div className="text-3xl font-bold">{cpuInfo.total_cores}</div>
              <div className="text-xs text-muted-foreground">{cpuInfo.physical_cores} physical</div>
            </div>
          </div>

          {/* Detailed Specifications */}
          <div className="pt-6 border-t">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Detailed Specifications</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Processor</p>
                <p className="font-medium">{systemInfo?.processor || "Unknown"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Architecture</p>
                <p className="font-medium">{systemInfo?.architecture || "Unknown"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Min Frequency</p>
                <p className="font-medium">{formatFrequency(cpuInfo.min_frequency)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Max Frequency</p>
                <p className="font-medium">{formatFrequency(cpuInfo.max_frequency)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Core Usage */}
      {cpuUsage && cpuUsage.cpu_usage_per_core && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Per-Core Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {cpuUsage.cpu_usage_per_core.map((usage, index) => (
                <div key={index} className="space-y-2">
                  <div className="text-sm font-medium text-center">Core {index + 1}</div>
                  <div className="text-lg font-bold text-center">{formatPercentage(usage)}</div>
                  <Progress value={usage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Advanced Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* CPU Time Statistics */}
          <div>
            <h4 className="text-sm font-medium mb-4">CPU Time Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">User Time</p>
                <p className="text-lg font-semibold">{cpuInfo.cpu_times.user.toFixed(2)}s</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">System Time</p>
                <p className="text-lg font-semibold">{cpuInfo.cpu_times.system.toFixed(2)}s</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Idle Time</p>
                <p className="text-lg font-semibold">{cpuInfo.cpu_times.idle.toFixed(2)}s</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">I/O Wait</p>
                <p className="text-lg font-semibold">{cpuInfo.cpu_times.iowait.toFixed(2)}s</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">IRQ Time</p>
                <p className="text-lg font-semibold">
                  {(cpuInfo.cpu_times.irq + cpuInfo.cpu_times.softirq).toFixed(2)}s
                </p>
              </div>
            </div>
          </div>

          {/* System Statistics */}
          <div className="pt-6 border-t">
            <h4 className="text-sm font-medium mb-4">System Statistics</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Context Switches</p>
                <p className="text-xl font-bold">{cpuInfo.cpu_stats.ctx_switches.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Interrupts</p>
                <p className="text-xl font-bold">{cpuInfo.cpu_stats.interrupts.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Soft Interrupts</p>
                <p className="text-xl font-bold">{cpuInfo.cpu_stats.soft_interrupts.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
