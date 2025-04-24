"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion"
import { DollarSign } from "lucide-react"
import confetti from "canvas-confetti"
import { themeConfig } from "@/lib/theme-config"

interface SlideToConfirmProps {
  text: string
  subText?: string
  onConfirm: () => void
  disabled?: boolean
  confettiColor?: string
  showConfetti?: boolean
}

export function SlideToConfirm({
  text,
  subText,
  onConfirm,
  disabled = false,
  confettiColor = "#1d4ed8", // Cor padrão azul
  showConfetti = true,
}: SlideToConfirmProps) {
  const constraintsRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  const x = useMotionValue(0)
  const [sliderWidth, setSliderWidth] = useState(0)
  const [buttonWidth, setButtonWidth] = useState(0)
  const [confirmed, setConfirmed] = useState(false)

  // Calcular largura máxima que o botão pode deslizar
  const maxX = sliderWidth - buttonWidth

  // Transformar a posição X em opacidade para o texto
  const textOpacity = useTransform(x, [0, maxX * 0.8], [1, 0])

  // Medir o tamanho do slider e do botão quando o componente montar
  useEffect(() => {
    if (constraintsRef.current && buttonRef.current) {
      setSliderWidth(constraintsRef.current.offsetWidth)
      setButtonWidth(buttonRef.current.offsetWidth)
    }
  }, [])

  // Função para lidar com o fim do arrasto
  const handleDragEnd = () => {
    const currentX = x.get()

    // Se arrastou mais de 90% do caminho, considerar como confirmado
    if (currentX > maxX * 0.9) {
      controls.start({ x: maxX })
      setConfirmed(true)

      // Disparar confetes se showConfetti for true
      if (showConfetti) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: [confettiColor, confettiColor, "#ffffff"],
        })
      }

      // Chamar a função de confirmação
      onConfirm()

      // Resetar o slider após um breve delay
      setTimeout(() => {
        controls.start({ x: 0 })
        setConfirmed(false)
      }, 1500)
    } else {
      // Caso contrário, voltar para o início
      controls.start({ x: 0 })
    }
  }

  // Resetar o slider
  useEffect(() => {
    if (!disabled && !confirmed) {
      controls.start({ x: 0 })
    }
  }, [disabled, confirmed, controls])

  return (
    <div className={`relative w-full h-14 rounded-full overflow-hidden ${disabled ? "opacity-50" : ""}`}>
      {/* Fundo */}
      <div
        ref={constraintsRef}
        className="absolute inset-0 rounded-full shadow-lg"
        style={{
          backgroundColor: themeConfig.colors.cardBackgroundDark,
          borderRadius: themeConfig.borderRadius.large,
        }}
      >
        {/* Texto que desaparece conforme o slider move */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-white font-medium"
          style={{ opacity: textOpacity }}
        >
          <div className="flex flex-col items-center">
            <span className="text-sm">{text}</span>
            {subText && <span className="text-sm">{subText}</span>}
          </div>
        </motion.div>
      </div>

      {/* Botão deslizante (círculo branco com cifrão) */}
      <motion.div
        ref={buttonRef}
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        className="absolute top-0.5 left-0.5 bottom-0.5 w-13 h-13 cursor-grab active:cursor-grabbing"
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.02 }}
        disabled={disabled}
      >
        {/* Círculo */}
        <div
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center"
          style={{
            backgroundColor: themeConfig.colors.cardBackground,
            boxShadow: themeConfig.shadows.small,
          }}
        >
          {/* Ícone de cifrão */}
          <DollarSign className="h-6 w-6" style={{ color: themeConfig.colors.accent }} />
        </div>
      </motion.div>
    </div>
  )
}
