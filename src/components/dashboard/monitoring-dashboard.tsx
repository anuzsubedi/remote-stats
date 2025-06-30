"use client"

import { useState, useEffect } from "react"
import { useMonitoringStore } from "@/stores/monitoring-store"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SystemOverview } from "./system-overview"
import { ProcessesMonitor } from "./processes"
import { StorageMonitor } from "./storage-monitor"
import { NetworkMonitor } from "./network-monitor"
import { GpuMonitor } from "./gpu-monitor"
import { CpuMonitor } from "./cpu-monitor"
import { Cpu, HardDrive, Network, Monitor, Zap, Home, Wifi, WifiOff, Activity } from "lucide-react"

const navigationItems = [
  { id: "overview", title: "Overview", icon: Home, color: "border-blue-500" },
  { id: "cpu", title: "CPU", icon: Cpu, color: "border-orange-500" },
  { id: "processes", title: "Processes", icon: Zap, color: "border-yellow-500" },
  { id: "storage", title: "Storage", icon: HardDrive, color: "border-purple-500" },
  { id: "network", title: "Network", icon: Network, color: "border-green-500" },
  { id: "gpu", title: "GPU", icon: Monitor, color: "border-red-500" },
]

export function MonitoringDashboard() {
  const { fetchAllData, startRealTimeUpdates, stopRealTimeUpdates, isConnected, error } = useMonitoringStore()
  const [activeView, setActiveView] = useState("overview")

  useEffect(() => {
    fetchAllData()
    startRealTimeUpdates()
    return () => {
      stopRealTimeUpdates()
    }
  }, [fetchAllData, startRealTimeUpdates, stopRealTimeUpdates])

  return (
    <SidebarProvider defaultOpen>
      <MonitoringDashboardContent
        activeView={activeView}
        setActiveView={setActiveView}
        isConnected={isConnected}
        error={error}
      />
    </SidebarProvider>
  )
}

interface MonitoringDashboardContentProps {
  activeView: string
  setActiveView: (id: string) => void
  isConnected: boolean
  error: string | null
}

function MonitoringDashboardContent({
  activeView,
  setActiveView,
  isConnected,
  error,
}: MonitoringDashboardContentProps) {
  const renderMainContent = () => {
    switch (activeView) {
      case "overview":
        return <SystemOverview />
      case "cpu":
        return <CpuMonitor />
      case "processes":
        return <ProcessesMonitor />
      case "storage":
        return <StorageMonitor />
      case "network":
        return <NetworkMonitor />
      case "gpu":
        return <GpuMonitor />
      default:
        return <SystemOverview />
    }
  }

  const currentItem = navigationItems.find((item) => item.id === activeView)

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4 border-b group-data-[collapsible=icon]:p-3 group-data-[collapsible=icon]:border-b-0 group-data-[collapsible=icon]:bg-gradient-to-br group-data-[collapsible=icon]:from-primary/5 group-data-[collapsible=icon]:to-primary/10">
          <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
            <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold">System Monitor</h1>
                
              </div>
            </div>
        
            <SidebarTrigger />
          </div>
        </SidebarHeader>

        <SidebarContent className="p-0 group-data-[collapsible=icon]:py-2">
          <SidebarGroup className="p-0">
            <SidebarGroupContent className="p-0">
              <SidebarMenu className="space-y-0 p-0 group-data-[collapsible=icon]:space-y-1 group-data-[collapsible=icon]:px-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeView === item.id

                  return (
                    <SidebarMenuItem key={item.id} className="w-full">
                      <SidebarMenuButton
                        onClick={() => setActiveView(item.id)}
                        className={`
                          relative w-full h-14 px-4 rounded-none border-r-4 transition-all duration-200
                          group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:rounded-md group-data-[collapsible=icon]:border-r-0 group-data-[collapsible=icon]:border-l-0 group-data-[collapsible=icon]:mx-0 group-data-[collapsible=icon]:border-0
                          hover:bg-accent/50 group-data-[collapsible=icon]:hover:bg-accent
                          ${
                            isActive
                              ? `bg-accent/30 ${item.color} group-data-[collapsible=icon]:bg-accent`
                              : "border-transparent group-data-[collapsible=icon]:bg-transparent"
                          }
                        `}
                        tooltip={item.title}
                      >
                        <Icon
                          className={`h-5 w-5 transition-colors flex-shrink-0 ${
                            isActive 
                              ? "text-primary group-data-[collapsible=icon]:text-foreground" 
                              : "text-muted-foreground"
                          }`}
                        />
                        <span
                          className={`font-medium transition-colors group-data-[collapsible=icon]:hidden ml-3 ${
                            isActive ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {item.title}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t mt-auto group-data-[collapsible=icon]:p-3 group-data-[collapsible=icon]:border-t-0 group-data-[collapsible=icon]:bg-gradient-to-t group-data-[collapsible=icon]:from-muted/20 group-data-[collapsible=icon]:to-transparent">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:bg-background/50 group-data-[collapsible=icon]:border group-data-[collapsible=icon]:border-border/50">
            {isConnected ? (
              <div className="relative">
                <Wifi className="h-4 w-4 text-green-600 flex-shrink-0 group-data-[collapsible=icon]:text-green-500" />
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500 animate-pulse group-data-[collapsible=icon]:hidden" />
              </div>
            ) : (
              <WifiOff className="h-4 w-4 text-red-600 flex-shrink-0 group-data-[collapsible=icon]:text-red-500" />
            )}
            <div className="flex-1 group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium">{isConnected ? "Connected" : "Disconnected"}</p>
              <p className="text-xs text-muted-foreground">{isConnected ? "Live monitoring" : "Offline mode"}</p>
            </div>
          </div>

          <div className="text-center pt-4 group-data-[collapsible=icon]:hidden">
            <p className="text-xs text-muted-foreground">
              Made with ♥ by{" "}
              <a
                href="https://anuz.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                anuz
              </a>
            </p>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 items-center gap-4 border-b px-6">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>

          {currentItem && (
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold">{currentItem.title}</h1>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            {isConnected && (
              <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                Live
              </Badge>
            )}
            {error && (
              <Badge variant="destructive">
                <WifiOff className="h-3 w-3 mr-1" />
                Error
              </Badge>
            )}
          </div>
        </header>

        {error && (
          <div className="p-6">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <WifiOff className="h-5 w-5" />
                  Connection Error
                </CardTitle>
                <CardDescription className="text-red-600">{error}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        <main className="flex-1 overflow-auto">
          <div className="p-6">{renderMainContent()}</div>
        </main>
      </SidebarInset>
    </>
  )
}
