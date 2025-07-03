"use client"

import { useMonitoringStore } from "@/stores/monitoring-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { formatBytes, formatPercentage, formatTemperature, formatFrequency, formatUptime } from "@/utils/formatters"
import { Cpu, MemoryStick, HardDrive, Thermometer, Activity, Monitor, Server } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { useState, useEffect, useCallback } from "react"

interface TemperatureReading {
  label: string
  temperature: number
  icon: string
}

export function SystemOverview() {
  const { cpuUsage, memoryUsage, storageUsage, cpuInfo, memoryInfo, systemInfo, gpuInfo, isConnected, error } =
    useMonitoringStore()

  // Chart data state
  const [chartData, setChartData] = useState<
    Array<{
      time: string
      cpu: number
      memory: number
      temperature: number
    }>
  >([])

  // Get temperature readings with useCallback
  const getTemperatureReadings = useCallback((): TemperatureReading[] => {
    const readings: TemperatureReading[] = []

    // CPU Temperature
    if (cpuInfo && cpuInfo.temperature > 0) {
      readings.push({
        label: "CPU",
        temperature: cpuInfo.temperature,
        icon: "cpu",
      })
    }

    // GPU Temperatures
    if (gpuInfo?.nvidia) {
      gpuInfo.nvidia.forEach((gpu: { temperature: number }, index: number) => {
        if (gpu.temperature > 0) {
          readings.push({
            label: `GPU ${index + 1}`,
            temperature: gpu.temperature,
            icon: "gpu",
          })
        }
      })
    }

    if (gpuInfo?.amd) {
      gpuInfo.amd.forEach((gpu: { temperature: number }, index: number) => {
        if (gpu.temperature > 0) {
          readings.push({
            label: `GPU ${index + 1}`,
            temperature: gpu.temperature,
            icon: "gpu",
          })
        }
      })
    }

    // Raspberry Pi GPU Temperature
    if (gpuInfo?.raspberry_pi?.available && gpuInfo.raspberry_pi.temperature) {
      const tempMatch = gpuInfo.raspberry_pi.temperature.match(/temp=([\d.]+)/)
      if (tempMatch) {
        readings.push({
          label: "GPU",
          temperature: Number.parseFloat(tempMatch[1]),
          icon: "gpu",
        })
      }
    }

    return readings
  }, [cpuInfo, gpuInfo])

  // Update chart data when new data comes in
  useEffect(() => {
    const now = new Date()
    const timeString = now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

    // Get maximum temperature for charts
    const getMaxTemperature = () => {
      const temperatureReadings = getTemperatureReadings()
      return temperatureReadings.length > 0
        ? Math.max(...temperatureReadings.map((r: TemperatureReading) => r.temperature))
        : 0
    }

    const newDataPoint = {
      time: timeString,
      cpu: cpuUsage?.cpu_usage_percent || 0,
      memory: memoryUsage?.percent || 0,
      temperature: getMaxTemperature(),
    }

    setChartData((prev) => {
      const updated = [...prev, newDataPoint]
      // Keep only last 20 data points for performance
      return updated.slice(-20)
    })
  }, [cpuUsage, memoryUsage, getTemperatureReadings])

  const temperatureReadings = getTemperatureReadings()
  // Remove this line:
  // const maxTemperature = temperatureReadings.length > 0 ? Math.max(...temperatureReadings.map((r: TemperatureReading) => r.temperature)) : 0

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Connection Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* System Information Header */}
      {systemInfo && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Hostname</p>
                  <p className="font-medium">{systemInfo.hostname}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Platform</p>
                  <p className="font-medium">
                    {systemInfo.platform} {systemInfo.architecture}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kernel</p>
                  <p className="font-medium">{systemInfo.platform_release}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <p className="font-medium">{formatUptime(systemInfo.uptime)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Hardware Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {cpuInfo && (
                  <div>
                    <p className="text-sm text-muted-foreground">CPU</p>
                    <p className="font-medium">{cpuInfo.total_cores} cores</p>
                    <p className="text-xs text-muted-foreground">{formatFrequency(cpuInfo.max_frequency)}</p>
                  </div>
                )}
                {memoryInfo && (
                  <div>
                    <p className="text-sm text-muted-foreground">Memory</p>
                    <p className="font-medium">{formatBytes(memoryInfo.total)}</p>
                    <p className="text-xs text-muted-foreground">
                      {memoryInfo.swap.total > 0 ? `+${formatBytes(memoryInfo.swap.total)} swap` : "No swap"}
                    </p>
                  </div>
                )}
                {storageUsage && (
                  <div>
                    <p className="text-sm text-muted-foreground">Storage</p>
                    <p className="font-medium">{formatBytes(storageUsage.total_space)}</p>
                    <p className="text-xs text-muted-foreground">
                      {storageUsage.partitions_count} partition{storageUsage.partitions_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={isConnected ? "default" : "destructive"}>
                    {isConnected ? "Connected" : "Offline"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resource Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Resource Usage
          </CardTitle>
          <CardDescription>Current system resource utilization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {/* CPU Usage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">CPU</span>
                </div>
                <span className="text-2xl font-bold">
                  {cpuUsage ? formatPercentage(cpuUsage.cpu_usage_percent) : "--"}
                </span>
              </div>
              <Progress value={cpuUsage?.cpu_usage_percent || 0} className="h-2" />
              {cpuInfo && (
                <div className="text-xs text-muted-foreground">
                  {formatFrequency(cpuInfo.current_frequency)} / {formatFrequency(cpuInfo.max_frequency)}
                </div>
              )}
            </div>

            {/* Memory Usage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MemoryStick className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Memory</span>
                </div>
                <span className="text-2xl font-bold">{memoryUsage ? formatPercentage(memoryUsage.percent) : "--"}</span>
              </div>
              <Progress value={memoryUsage?.percent || 0} className="h-2" />
              {memoryUsage && (
                <div className="text-xs text-muted-foreground">
                  {formatBytes(memoryUsage.used)} / {formatBytes(memoryUsage.total)}
                </div>
              )}
            </div>

            {/* Storage Usage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Storage</span>
                </div>
                <span className="text-2xl font-bold">
                  {storageUsage ? formatPercentage(storageUsage.usage_percent) : "--"}
                </span>
              </div>
              <Progress value={storageUsage?.usage_percent || 0} className="h-2" />
              {storageUsage && (
                <div className="text-xs text-muted-foreground">
                  {formatBytes(storageUsage.used_space)} / {formatBytes(storageUsage.total_space)}
                </div>
              )}
            </div>
          </div>

          {/* Temperature Section */}
          {temperatureReadings.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center gap-2 mb-4">
                <Thermometer className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Temperature Monitoring</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {temperatureReadings.map((reading, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{reading.label}</span>
                      <Badge
                        variant={
                          reading.temperature < 60 ? "secondary" : reading.temperature < 75 ? "default" : "destructive"
                        }
                      >
                        {reading.temperature < 60 ? "Cool" : reading.temperature < 75 ? "Warm" : "Hot"}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold">{formatTemperature(reading.temperature)}</div>
                    <Progress value={Math.min((reading.temperature / 85) * 100, 100)} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* CPU Usage & Temperature Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              CPU Usage & Temperature
            </CardTitle>
            <CardDescription>Real-time CPU utilization and temperature</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                  <YAxis
                    yAxisId="left"
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, "dataMax + 10"]}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}°C`}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === "CPU Usage") {
                        return [`${value.toFixed(1)}%`, name]
                      } else {
                        return [`${value.toFixed(1)}°C`, name]
                      }
                    }}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="cpu"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: "#3b82f6", strokeWidth: 2 }}
                    name="CPU Usage"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="temperature"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444", strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: "#ef4444", strokeWidth: 2 }}
                    name="Temperature"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Memory Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MemoryStick className="h-4 w-4" />
              Memory Usage Over Time
            </CardTitle>
            <CardDescription>Real-time memory utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}%`} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)}%`, "Memory Usage"]}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="memory"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
