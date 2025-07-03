"use client"

import { useMonitoringStore } from "@/stores/monitoring-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { formatBytes, formatTemperature, formatPercentage } from "@/utils/formatters"
import {
  Monitor,
  Thermometer,
  MemoryStick,
  Clock,
  Zap,
  AlertCircle,
  Info,
  Cpu,
  Activity,
  Shield,
  HardDrive,
  BarChart3,
} from "lucide-react"

type RaspberryPiGpuInfo = {
  available: boolean
  gpu_memory: string
  type: string
  temperature?: string
  frequency?: string
  gpu_freq?: number | null
  gpu_freq_source?: string | null
  reloc_memory?: string
  malloc_memory?: string
  total_memory?: string
  core_clock?: number | string | null
  v3d_clock?: number | string | null
  isp_clock?: number | string | null
  hevc_clock?: number | string | null
  h264_clock?: number | string | null
  throttled?: string | null
  voltage?: string | null
}

export function GpuMonitor() {
  const { gpuInfo } = useMonitoringStore()

  // Check what GPUs are available
  const hasNvidiaGPU = gpuInfo?.nvidia && gpuInfo.nvidia.length > 0
  const hasAmdGPU = gpuInfo?.amd && gpuInfo.amd.length > 0
  const hasIntegratedGPU = gpuInfo?.integrated && gpuInfo.integrated.length > 0
  const hasPiGPU = gpuInfo?.raspberry_pi?.available
  const hasAnyGPU = hasNvidiaGPU || hasAmdGPU || hasIntegratedGPU || hasPiGPU

  const piGpu: RaspberryPiGpuInfo | undefined = gpuInfo?.raspberry_pi

  if (!hasAnyGPU) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">GPU Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            No graphics hardware detected or no compatible graphics hardware is available on this system.
          </div>
        </CardContent>
      </Card>
    )
  }

  // Count total GPUs
  const totalGPUs =
    (gpuInfo?.nvidia?.length || 0) +
    (gpuInfo?.amd?.length || 0) +
    (gpuInfo?.integrated?.length || 0) +
    (hasPiGPU ? 1 : 0)

  function parsePiMem(val?: string) {
    if (!val) return "N/A"
    const match = val.match(/=([0-9]+)M/)
    return match ? `${match[1]} MB` : val
  }

  function parsePiClock(val?: number | string | null) {
    if (!val || val === "N/A" || val === 0 || val === "0") return "0 MHz"
    const num = typeof val === "string" ? Number.parseInt(val) : val
    if (!num || Number.isNaN(num)) return "N/A"
    return `${Math.round(num / 1e6)} MHz`
  }

  function parsePiTemp(val?: string) {
    if (!val) return "N/A"
    const match = val.match(/temp=([\d.]+)/)
    return match ? `${match[1]}°C` : val
  }

  function parsePiVoltage(val?: string) {
    if (!val) return "N/A"
    const match = val.match(/volt=([\d.]+)V/)
    return match ? `${match[1]} V` : val
  }

  function parseThrottled(val?: string) {
    if (!val) return { code: "", status: "Unknown", severity: "unknown" }
    const match = val.match(/throttled=0x([0-9a-fA-F]+)/)
    if (!match) return { code: val, status: "Unknown", severity: "unknown" }

    const code = match[1]
    const codeNum = Number.parseInt(code, 16)

    if (codeNum === 0) return { code, status: "Optimal", severity: "good" }
    if (codeNum & 0x1) return { code, status: "Under-voltage detected", severity: "critical" }
    if (codeNum & 0x2) return { code, status: "Frequency capped", severity: "warning" }
    if (codeNum & 0x4) return { code, status: "Currently throttled", severity: "critical" }
    if (codeNum & 0x8) return { code, status: "Temperature limit active", severity: "warning" }
    return { code, status: "Warning", severity: "warning" }
  }

  function extractConfigFields(config?: string) {
    if (!config) return []

    const important = [
      "arm_freq",
      "core_freq",
      "v3d_freq",
      "hevc_freq",
      "isp_freq",
      "total_mem",
      "arm_64bit",
      "arm_boost",
    ]

    const lines = config.split(/\s+/)
    return lines
      .map((line) => line.split("="))
      .filter(([k]) => important.includes(k))
      .map(([k, value]) => ({ key: k, value }))
      .slice(0, 8)
  }

  const throttleStatus = parseThrottled(piGpu?.throttled ?? undefined)
  const temperature = piGpu?.temperature ? Number.parseFloat(piGpu.temperature.match(/([\d.]+)/)?.[1] || "0") : 0

  return (
    <div className="space-y-6">
      {/* GPU Overview & Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            GPU Overview & Specifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total GPUs */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total GPUs</span>
              </div>
              <div className="text-3xl font-bold">{totalGPUs}</div>
              <div className="text-xs text-muted-foreground">Active graphics devices</div>
            </div>

            {/* NVIDIA Count */}
            {hasNvidiaGPU && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">NVIDIA</span>
                </div>
                <div className="text-3xl font-bold">{gpuInfo.nvidia.length}</div>
                <Badge variant="secondary">Discrete</Badge>
              </div>
            )}

            {/* AMD Count */}
            {hasAmdGPU && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">AMD</span>
                </div>
                <div className="text-3xl font-bold">{gpuInfo.amd.length}</div>
                <Badge variant="secondary">Radeon</Badge>
              </div>
            )}

            {/* Integrated Count */}
            {hasIntegratedGPU && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Integrated</span>
                </div>
                <div className="text-3xl font-bold">{gpuInfo.integrated.length}</div>
                <Badge variant="secondary">Built-in</Badge>
              </div>
            )}

            {/* Raspberry Pi GPU */}
            {hasPiGPU && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Raspberry Pi</span>
                </div>
                <div className="text-3xl font-bold">1</div>
                <Badge variant="secondary">VideoCore</Badge>
              </div>
            )}
          </div>

          {/* System Information */}
          <div className="pt-6 border-t">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Graphics Support</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">OpenGL</p>
                <p className="font-medium">{gpuInfo?.opengl ? "Available" : "Not Available"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Hardware Acceleration</p>
                <p className="font-medium">Enabled</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Devices</p>
                <p className="font-medium">{totalGPUs}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium">Active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NVIDIA GPUs */}
      {hasNvidiaGPU && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              NVIDIA Graphics Cards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {gpuInfo.nvidia.map((gpu, index) => (
              <div key={`nvidia-${index}`} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">{gpu.name}</h4>
                  <Badge>GPU {index + 1}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* GPU Usage */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Usage</span>
                    </div>
                    <div className="text-3xl font-bold">{formatPercentage(gpu.utilization)}</div>
                    <Progress value={gpu.utilization} className="h-2" />
                  </div>

                  {/* Memory Usage */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MemoryStick className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Memory</span>
                    </div>
                    <div className="text-3xl font-bold">{formatPercentage((gpu.memory_used / gpu.memory_total) * 100)}</div>
                    <Progress value={(gpu.memory_used / gpu.memory_total) * 100} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {formatBytes(gpu.memory_used * 1024 * 1024)} / {formatBytes(gpu.memory_total * 1024 * 1024)}
                    </div>
                  </div>

                  {/* Clock Speed */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Clock</span>
                    </div>
                    <div className="text-3xl font-bold">{gpu.frequency !== null ? `${gpu.frequency} MHz` : "N/A"}</div>
                    <div className="text-xs text-muted-foreground">Core frequency</div>
                  </div>

                  {/* Temperature */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Temperature</span>
                    </div>
                    <div className="text-3xl font-bold">{formatTemperature(gpu.temperature)}</div>
                    <Badge
                      variant={
                        gpu.temperature < 65 ? "secondary" : gpu.temperature < 80 ? "default" : "destructive"
                      }
                    >
                      {gpu.temperature < 65 ? "Cool" : gpu.temperature < 80 ? "Warm" : "Hot"}
                    </Badge>
                  </div>
                </div>
                {index < gpuInfo.nvidia.length - 1 && <hr className="border-border" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AMD GPUs */}
      {hasAmdGPU && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              AMD Graphics Cards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {gpuInfo.amd.map((gpu, index) => (
              <div key={`amd-${index}`} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">{gpu.name}</h4>
                  <Badge>GPU {index + 1}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* GPU Usage */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Usage</span>
                    </div>
                    <div className="text-3xl font-bold">{formatPercentage(gpu.utilization)}</div>
                    <Progress value={gpu.utilization} className="h-2" />
                  </div>

                  {/* Memory Usage */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MemoryStick className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Memory</span>
                    </div>
                    <div className="text-3xl font-bold">{formatPercentage((gpu.memory_used / gpu.memory_total) * 100)}</div>
                    <Progress value={(gpu.memory_used / gpu.memory_total) * 100} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {formatBytes(gpu.memory_used * 1024 * 1024)} / {formatBytes(gpu.memory_total * 1024 * 1024)}
                    </div>
                  </div>

                  {/* Clock Speed */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Clock</span>
                    </div>
                    <div className="text-3xl font-bold">{gpu.frequency !== null ? `${gpu.frequency} MHz` : "N/A"}</div>
                    <div className="text-xs text-muted-foreground">Core frequency</div>
                  </div>

                  {/* Temperature */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Temperature</span>
                    </div>
                    <div className="text-3xl font-bold">{formatTemperature(gpu.temperature)}</div>
                    <Badge
                      variant={
                        gpu.temperature < 70 ? "secondary" : gpu.temperature < 85 ? "default" : "destructive"
                      }
                    >
                      {gpu.temperature < 70 ? "Cool" : gpu.temperature < 85 ? "Warm" : "Hot"}
                    </Badge>
                  </div>
                </div>
                {index < gpuInfo.amd.length - 1 && <hr className="border-border" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Integrated GPUs */}
      {hasIntegratedGPU && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Integrated Graphics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {gpuInfo.integrated.map((gpu, index) => (
              <div key={`integrated-${index}`} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">{gpu.name}</h4>
                  <Badge variant="secondary">{gpu.type}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* GPU Usage */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Usage</span>
                    </div>
                    <div className="text-3xl font-bold">{gpu.usage_percent}%</div>
                    <Progress value={Number.parseFloat(gpu.usage_percent)} className="h-2" />
                    <div className="text-xs text-muted-foreground">Source: {gpu.source}</div>
                  </div>

                  {/* Graphics Type */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Type</span>
                    </div>
                    <div className="text-3xl font-bold">Integrated</div>
                    <div className="text-xs text-muted-foreground">Built into processor</div>
                  </div>
                </div>
                {index < gpuInfo.integrated.length - 1 && <hr className="border-border" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Raspberry Pi GPU */}
      {hasPiGPU && piGpu && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Raspberry Pi GPU
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Temperature */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Temperature</span>
                </div>
                <div className="text-3xl font-bold">{parsePiTemp(piGpu.temperature ?? undefined)}</div>
                <Badge
                  variant={
                    temperature < 60 ? "secondary" : temperature < 80 ? "default" : "destructive"
                  }
                >
                  {temperature < 60 ? "Cool" : temperature < 80 ? "Warm" : "Hot"}
                </Badge>
              </div>

              {/* GPU Memory */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">GPU Memory</span>
                </div>
                <div className="text-3xl font-bold">{parsePiMem(piGpu?.gpu_memory ?? undefined)}</div>
                <div className="text-xs text-muted-foreground">Dedicated VRAM</div>
              </div>

              {/* Core Clock */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Core Clock</span>
                </div>
                <div className="text-3xl font-bold">{parsePiClock(piGpu?.core_clock != null ? String(piGpu.core_clock) : undefined)}</div>
                <div className="text-xs text-muted-foreground">Base frequency</div>
              </div>

              {/* System Status */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {throttleStatus.severity === "good" ? (
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">Status</span>
                </div>
                <div className="text-3xl font-bold">{throttleStatus.status}</div>
                <Badge
                  variant={
                    throttleStatus.severity === "good" ? "secondary" : 
                    throttleStatus.severity === "warning" ? "default" : "destructive"
                  }
                >
                  {throttleStatus.code || "0x0"}
                </Badge>
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
                  <p className="text-muted-foreground">GPU Type</p>
                  <p className="font-medium">{piGpu.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Voltage</p>
                  <p className="font-medium">{parsePiVoltage(piGpu?.voltage ?? undefined)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">V3D Clock</p>
                  <p className="font-medium">{parsePiClock(piGpu?.v3d_clock != null ? String(piGpu.v3d_clock) : undefined)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ISP Clock</p>
                  <p className="font-medium">{parsePiClock(piGpu?.isp_clock != null ? String(piGpu.isp_clock) : undefined)}</p>
                </div>
              </div>
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
          {/* Memory Allocation (Pi GPU) */}
          {hasPiGPU && piGpu && (
            <div>
              <h4 className="text-sm font-medium mb-4">Memory Allocation</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">GPU Memory</p>
                  <p className="text-lg font-semibold">{parsePiMem(piGpu?.gpu_memory ?? undefined)}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Relocatable</p>
                  <p className="text-lg font-semibold">{parsePiMem(piGpu?.reloc_memory ?? undefined)}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Malloc</p>
                  <p className="text-lg font-semibold">{parsePiMem(piGpu?.malloc_memory ?? undefined)}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-lg font-semibold">{parsePiMem(piGpu?.total_memory ?? undefined)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Clock Frequencies (Pi GPU) */}
          {hasPiGPU && piGpu && (
            <div className="pt-6 border-t">
              <h4 className="text-sm font-medium mb-4">Clock Frequencies</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Core</p>
                  <p className="text-lg font-semibold">{parsePiClock(piGpu?.core_clock != null ? String(piGpu.core_clock) : undefined)}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">V3D</p>
                  <p className="text-lg font-semibold">{parsePiClock(piGpu?.v3d_clock != null ? String(piGpu.v3d_clock) : undefined)}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">ISP</p>
                  <p className="text-lg font-semibold">{parsePiClock(piGpu?.isp_clock != null ? String(piGpu.isp_clock) : undefined)}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">HEVC</p>
                  <p className="text-lg font-semibold">{parsePiClock(piGpu?.hevc_clock != null ? String(piGpu.hevc_clock) : undefined)}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">H264</p>
                  <p className="text-lg font-semibold">{parsePiClock(piGpu?.h264_clock != null ? String(piGpu.h264_clock) : undefined)}</p>
                </div>
              </div>
            </div>
          )}

          {/* System Configuration (Pi GPU) */}
          {hasPiGPU && piGpu && extractConfigFields(piGpu.frequency).length > 0 && (
            <div className="pt-6 border-t">
              <h4 className="text-sm font-medium mb-4">System Configuration</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {extractConfigFields(piGpu.frequency).map(({ key, value }) => (
                  <div key={key} className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">{key.replace(/_/g, " ")}</p>
                    <p className="text-lg font-semibold font-mono">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System Summary */}
          <div className="pt-6 border-t">
            <h4 className="text-sm font-medium mb-4">System Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">NVIDIA GPUs</p>
                <p className="text-xl font-bold">{gpuInfo?.nvidia?.length || 0}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">AMD GPUs</p>
                <p className="text-xl font-bold">{gpuInfo?.amd?.length || 0}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Integrated GPUs</p>
                <p className="text-xl font-bold">{gpuInfo?.integrated?.length || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
