'use client'

import { useEffect, useRef } from 'react'

interface EntropyProps {
  size?: number
  className?: string
  particleColor?: string
}

export const Entropy = ({ 
  size = 400, 
  className = "",
  particleColor = "rgba(255, 255, 255, " 
}: EntropyProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const particles: Particle[] = []
    const particleCount = 60
    const connectionDistance = 100

    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      neighbors: Particle[] = []

      constructor() {
        this.x = Math.random() * size
        this.y = Math.random() * size
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.size = Math.random() * 2 + 1
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        if (this.x < 0 || this.x > size) this.vx *= -1
        if (this.y < 0 || this.y > size) this.vy *= -1
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff66'
        ctx.fill()
      }
    }

    // 初始化粒子
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    let animationId: number
    
    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, size, size)

      particles.forEach(particle => {
        particle.update()
        particle.draw(ctx)

        // 连接近距离粒子
        particles.forEach(other => {
          if (particle === other) return
          const dx = particle.x - other.x
          const dy = particle.y - other.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < connectionDistance) {
            const alpha = 1 - (dist / connectionDistance)
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.2})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.stroke()
          }
        })
      })

      // 绘制装饰性中心线
      ctx.strokeStyle = `rgba(255, 255, 255, 0.05)`
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(size / 2, 0)
      ctx.lineTo(size / 2, size)
      ctx.stroke()

      ctx.font = '10px monospace'
      ctx.fillStyle = '#ffffff44'
      ctx.textAlign = 'center'
      ctx.fillText('OROCARE ANALYSIS GATEWAY', size / 2, 20)
      ctx.fillText('BIO-PATTERN EXTRACTION: ACTIVE', size / 2, size - 10)

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [size, particleColor])

  return (
    <canvas 
      ref={canvasRef} 
      width={size} 
      height={size}
      className={`bg-transparent ${className}`}
    />
  )
}
