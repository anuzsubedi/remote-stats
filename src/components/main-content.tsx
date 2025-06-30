
import { ThemeToggle } from "@/components/theme-toggle"
import { MonitoringDashboard } from "@/components/dashboard/monitoring-dashboard"

export function MainContent() {
  return (
    <div className="min-h-svh">
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      
      <MonitoringDashboard />
    </div>
  )
} 