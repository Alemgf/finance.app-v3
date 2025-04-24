"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"

interface BubbleCheckboxProps {
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  size?: "sm" | "md" | "lg"
}

export function BubbleCheckbox({ id, checked, onCheckedChange, size = "md" }: BubbleCheckboxProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Determinar tamanho com base no prop size
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  }

  const checkSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <button
        type="button"
        id={id}
        onClick={() => onCheckedChange(!checked)}
        className={`${sizeClasses[size]} rounded-full border-2 border-blue-500 flex items-center justify-center transition-colors ${
          checked ? "bg-blue-500" : "bg-white"
        } ${isHovered && !checked ? "bg-blue-100" : ""}`}
        aria-checked={checked}
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 15,
              }}
            >
              <Check className={`${checkSizes[size]} text-white`} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Bolhas que estouram quando marcado */}
      <AnimatePresence>
        {checked && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-blue-300"
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 0.8,
                  scale: 0,
                }}
                animate={{
                  x: (Math.random() - 0.5) * 30,
                  y: (Math.random() - 0.5) * 30,
                  opacity: 0,
                  scale: Math.random() * 1 + 0.5,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.05,
                  ease: [0.36, 0.66, 0.04, 1],
                }}
                style={{
                  top: "50%",
                  left: "50%",
                  translateX: "-50%",
                  translateY: "-50%",
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
