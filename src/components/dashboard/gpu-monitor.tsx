"use client"

import { useMonitoringStore } from "@/stores/monitoring-store"
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
  Settings,
  Cpu,
  Activity,
  Shield,
  HardDrive,
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center shadow-xl border border-slate-200 dark:border-slate-800 max-w-2xl">
          <div className="w-24 h-24 mx-auto mb-8 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
            <AlertCircle className="h-12 w-12 text-slate-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">No Graphics Hardware Detected</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            No GPU information is available or no compatible graphics hardware is detected on this system.
          </p>
        </div>
      </div>
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center">
                  <Monitor className="h-10 w-10 text-white dark:text-slate-900" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-2">Graphics Hardware</h1>
                  <p className="text-xl text-slate-600 dark:text-slate-400">
                    Real-time GPU monitoring and performance analytics
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-6xl font-bold text-slate-900 dark:text-white">{totalGPUs}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                  GPU{totalGPUs !== 1 ? "s" : ""} Active
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GPU Type Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {hasNvidiaGPU && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">{gpuInfo.nvidia.length}</div>
              <div className="text-lg font-semibold text-slate-900 dark:text-white">NVIDIA</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Graphics Cards</div>
            </div>
          )}

          {hasAmdGPU && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">{gpuInfo.amd.length}</div>
              <div className="text-lg font-semibold text-slate-900 dark:text-white">AMD</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Graphics Cards</div>
            </div>
          )}

          {hasIntegratedGPU && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Cpu className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {gpuInfo.integrated.length}
              </div>
              <div className="text-lg font-semibold text-slate-900 dark:text-white">Integrated</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Graphics</div>
            </div>
          )}

          {hasPiGPU && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Monitor className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">1</div>
              <div className="text-lg font-semibold text-slate-900 dark:text-white">Raspberry Pi</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">GPU</div>
            </div>
          )}
        </div>

        {/* NVIDIA GPUs */}
        {hasNvidiaGPU && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-8 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">NVIDIA Graphics Cards</h2>
                  <p className="text-slate-600 dark:text-slate-400">High-performance discrete graphics</p>
                </div>
              </div>
            </div>
            <div className="p-8 space-y-8">
              {gpuInfo.nvidia.map((gpu, index) => (
                <div key={`nvidia-${index}`} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{gpu.name}</h3>
                    <Badge className="px-4 py-2 text-sm font-semibold bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      GPU {index + 1}
                    </Badge>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">GPU Usage</div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {formatPercentage(gpu.utilization)}
                          </div>
                        </div>
                      </div>
                      <Progress value={gpu.utilization} className="h-3" />
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                          <MemoryStick className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Memory Usage</div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {formatPercentage((gpu.memory_used / gpu.memory_total) * 100)}
                          </div>
                        </div>
                      </div>
                      <Progress value={(gpu.memory_used / gpu.memory_total) * 100} className="h-3" />
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {formatBytes(gpu.memory_used * 1024 * 1024)} / {formatBytes(gpu.memory_total * 1024 * 1024)}
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                          <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Clock Speed</div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {gpu.frequency !== null ? `${gpu.frequency} MHz` : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                          <Thermometer className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Temperature</div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {formatTemperature(gpu.temperature)}
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={`mt-2 ${
                          gpu.temperature < 65
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : gpu.temperature < 80
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {gpu.temperature < 65 ? "Optimal" : gpu.temperature < 80 ? "Warm" : "Hot"}
                      </Badge>
                    </div>
                  </div>
                  {index < gpuInfo.nvidia.length - 1 && <hr className="border-slate-200 dark:border-slate-800" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AMD GPUs */}
        {hasAmdGPU && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-8 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">AMD Graphics Cards</h2>
                  <p className="text-slate-600 dark:text-slate-400">Radeon graphics performance</p>
                </div>
              </div>
            </div>
            <div className="p-8 space-y-8">
              {gpuInfo.amd.map((gpu, index) => (
                <div key={`amd-${index}`} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{gpu.name}</h3>
                    <Badge className="px-4 py-2 text-sm font-semibold bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                      GPU {index + 1}
                    </Badge>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">GPU Usage</div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {formatPercentage(gpu.utilization)}
                          </div>
                        </div>
                      </div>
                      <Progress value={gpu.utilization} className="h-3" />
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                          <MemoryStick className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Memory Usage</div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {formatPercentage((gpu.memory_used / gpu.memory_total) * 100)}
                          </div>
                        </div>
                      </div>
                      <Progress value={(gpu.memory_used / gpu.memory_total) * 100} className="h-3" />
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {formatBytes(gpu.memory_used * 1024 * 1024)} / {formatBytes(gpu.memory_total * 1024 * 1024)}
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                          <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Clock Speed</div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {gpu.frequency !== null ? `${gpu.frequency} MHz` : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                          <Thermometer className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Temperature</div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {formatTemperature(gpu.temperature)}
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={`mt-2 ${
                          gpu.temperature < 70
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : gpu.temperature < 85
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {gpu.temperature < 70 ? "Optimal" : gpu.temperature < 85 ? "Warm" : "Hot"}
                      </Badge>
                    </div>
                  </div>
                  {index < gpuInfo.amd.length - 1 && <hr className="border-slate-200 dark:border-slate-800" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Integrated GPUs */}
        {hasIntegratedGPU && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-8 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                  <Cpu className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Integrated Graphics</h2>
                  <p className="text-slate-600 dark:text-slate-400">Built-in graphics processing</p>
                </div>
              </div>
            </div>
            <div className="p-8 space-y-8">
              {gpuInfo.integrated.map((gpu, index) => (
                <div key={`integrated-${index}`} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{gpu.name}</h3>
                    <Badge className="px-4 py-2 text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      {gpu.type}
                    </Badge>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">GPU Usage</div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">{gpu.usage_percent}%</div>
                        </div>
                      </div>
                      <Progress value={Number.parseFloat(gpu.usage_percent)} className="h-3" />
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">Source: {gpu.source}</div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                          <Info className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Graphics Type</div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">Integrated</div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Built into processor</div>
                    </div>
                  </div>
                  {index < gpuInfo.integrated.length - 1 && <hr className="border-slate-200 dark:border-slate-800" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raspberry Pi GPU */}
        {hasPiGPU && piGpu && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-8 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                    <Monitor className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Raspberry Pi GPU</h2>
                    <p className="text-slate-600 dark:text-slate-400">{piGpu.type}</p>
                  </div>
                </div>
                <Badge className="px-4 py-2 text-sm font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                  VideoCore
                </Badge>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Key Metrics Dashboard */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                      <Thermometer className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Temperature</div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {parsePiTemp(piGpu.temperature ?? undefined)}
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={`${
                      temperature < 60
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : temperature < 80
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {temperature < 60 ? "Optimal" : temperature < 80 ? "Warm" : "Critical"}
                  </Badge>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <HardDrive className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400">GPU Memory</div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {parsePiMem(piGpu?.gpu_memory ?? undefined)}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Dedicated VRAM</div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Core Clock</div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {parsePiClock(piGpu?.core_clock != null ? String(piGpu.core_clock) : undefined)}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Base frequency</div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        throttleStatus.severity === "good"
                          ? "bg-green-100 dark:bg-green-900/20"
                          : throttleStatus.severity === "warning"
                            ? "bg-yellow-100 dark:bg-yellow-900/20"
                            : "bg-red-100 dark:bg-red-900/20"
                      }`}
                    >
                      {throttleStatus.severity === "good" ? (
                        <Shield className={`h-5 w-5 text-green-600 dark:text-green-400`} />
                      ) : (
                        <AlertCircle
                          className={`h-5 w-5 ${
                            throttleStatus.severity === "warning"
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400">System Status</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">{throttleStatus.status}</div>
                    </div>
                  </div>
                  <Badge
                    className={`${
                      throttleStatus.severity === "good"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : throttleStatus.severity === "warning"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {throttleStatus.code || "0x0"}
                  </Badge>
                </div>
              </div>

              {/* Memory Allocation */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center space-x-3">
                  <MemoryStick className="h-6 w-6" />
                  <span>Memory Allocation</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "GPU Memory", value: parsePiMem(piGpu?.gpu_memory ?? undefined), desc: "Graphics memory" },
                    {
                      label: "Relocatable",
                      value: parsePiMem(piGpu?.reloc_memory ?? undefined),
                      desc: "Relocatable memory",
                    },
                    { label: "Malloc", value: parsePiMem(piGpu?.malloc_memory ?? undefined), desc: "Malloc memory" },
                    { label: "Total", value: parsePiMem(piGpu?.total_memory ?? undefined), desc: "Total memory" },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{item.label}</div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">{item.value}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clock Frequencies */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center space-x-3">
                  <Clock className="h-6 w-6" />
                  <span>Clock Frequencies</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    {
                      label: "Core",
                      value: parsePiClock(piGpu?.core_clock != null ? String(piGpu.core_clock) : undefined),
                    },
                    {
                      label: "V3D",
                      value: parsePiClock(piGpu?.v3d_clock != null ? String(piGpu.v3d_clock) : undefined),
                    },
                    {
                      label: "ISP",
                      value: parsePiClock(piGpu?.isp_clock != null ? String(piGpu.isp_clock) : undefined),
                    },
                    {
                      label: "HEVC",
                      value: parsePiClock(piGpu?.hevc_clock != null ? String(piGpu.hevc_clock) : undefined),
                    },
                    {
                      label: "H264",
                      value: parsePiClock(piGpu?.h264_clock != null ? String(piGpu.h264_clock) : undefined),
                    },
                  ].map((clock) => (
                    <div key={clock.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-center">
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{clock.label}</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">{clock.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Configuration */}
              {extractConfigFields(piGpu.frequency).length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center space-x-3">
                    <Settings className="h-6 w-6" />
                    <span>System Configuration</span>
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {extractConfigFields(piGpu.frequency).map(({ key, value }) => (
                        <div
                          key={key}
                          className="bg-white dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
                        >
                          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                            {key.replace(/_/g, " ")}
                          </div>
                          <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center space-x-3">
                  <Info className="h-6 w-6" />
                  <span>Additional Information</span>
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Voltage</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {parsePiVoltage(piGpu?.voltage ?? undefined)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">System voltage</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">GPU Type</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{piGpu.type}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">VideoCore architecture</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-8 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                <Info className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">System Overview</h2>
                <p className="text-slate-600 dark:text-slate-400">Graphics hardware summary and capabilities</p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Graphics Support</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="font-medium text-slate-700 dark:text-slate-300">OpenGL Available</span>
                    <Badge
                      className={`${
                        gpuInfo?.opengl
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {gpuInfo?.opengl ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Hardware Acceleration</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Enabled
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Hardware Summary</h3>
                <div className="space-y-4">
                  {[
                    {
                      label: "NVIDIA GPUs",
                      value: gpuInfo?.nvidia?.length || 0,
                      color: "text-green-600 dark:text-green-400",
                    },
                    { label: "AMD GPUs", value: gpuInfo?.amd?.length || 0, color: "text-red-600 dark:text-red-400" },
                    {
                      label: "Integrated GPUs",
                      value: gpuInfo?.integrated?.length || 0,
                      color: "text-blue-600 dark:text-blue-400",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                    >
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                      <span className={`font-bold text-2xl ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Raspberry Pi GPU</span>
                    <Badge
                      className={`${
                        hasPiGPU
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {hasPiGPU ? "Available" : "Not Available"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
