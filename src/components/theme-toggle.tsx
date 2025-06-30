"use client"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="w-12 h-12 rounded-full">
        <div className="w-4 h-4 bg-muted-foreground rounded-full animate-pulse" />
      </Button>
    )
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="w-12 h-12 rounded-full relative overflow-hidden group"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-10 rounded-full"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.1 }}
          transition={{ duration: 0.2 }}
        />
        
        <AnimatePresence mode="wait">
          {theme === 'light' ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              exit={{ rotate: 90, scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <FontAwesomeIcon 
                icon={faSun} 
                className="w-4 h-4 text-yellow-500"
              />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              exit={{ rotate: -90, scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <FontAwesomeIcon 
                icon={faMoon} 
                className="w-4 h-4 text-blue-400"
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <span className="sr-only">Toggle theme</span>
      </Button>
    </motion.div>
  )
} 