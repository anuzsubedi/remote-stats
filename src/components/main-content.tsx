
import { ThemeToggle } from "@/components/theme-toggle"

export function MainContent() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      

      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">test</h1>
      </div>
    </div>
  )
} 