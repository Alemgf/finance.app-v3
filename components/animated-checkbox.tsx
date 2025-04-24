"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DollarSign } from "lucide-react"

interface AnimatedCheckboxProps {
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function AnimatedCheckbox({ id, checked, onCheckedChange }: AnimatedCheckboxProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="w-10 h-10 relative">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: checked ? 1 : 0.8,
            opacity: checked ? 1 : 0,
            rotate: checked ? 0 : -180,
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
        </motion.div>

        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 1, opacity: 1 }}
          animate={{
            scale: checked ? 0.8 : 1,
            opacity: checked ? 0 : 1,
            rotate: checked ? 180 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <div
            className={`w-10 h-10 rounded-full ${isHovered ? "bg-blue-400" : "bg-blue-500"} flex items-center justify-center`}
          >
            <DollarSign className="h-6 w-6 text-white" />
          </div>
        </motion.div>

        <input
          type="checkbox"
          id={id}
          className="sr-only"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
        />
      </div>

      {/* Partículas animadas quando marcado */}
      <AnimatePresence>
        {checked && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-green-500"
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                }}
                animate={{
                  x: Math.random() * 60 - 30,
                  y: Math.random() * 60 - 30,
                  opacity: 0,
                  scale: Math.random() * 0.5 + 0.5,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, delay: i * 0.05 }}
                style={{ top: "50%", left: "50%" }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
