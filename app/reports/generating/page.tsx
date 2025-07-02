"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, Circle, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepItemProps {
  completed?: boolean
  active?: boolean
  pending?: boolean
  title: string
}

function StepItem({ completed, active, pending, title }: StepItemProps) {
  return (
    <div className="flex items-center gap-3">
      {completed && <CheckCircle className="h-5 w-5 text-green-500" />}
      {active && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
      {pending && <Circle className="h-5 w-5 text-gray-300" />}
      <span
        className={cn(
          "text-sm",
          completed && "text-gray-700",
          active && "text-blue-600 font-medium",
          pending && "text-gray-400",
        )}
      >
        {title}
      </span>
    </div>
  )
}

export default function GeneratingPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(150) // 2分30秒

  const steps = ["分析政策要点", "匹配九江市地方特色", "生成专业报告内容", "格式优化"]

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(prev + 2, 100)

        // 更新当前步骤
        if (newProgress >= 25 && currentStep < 1) setCurrentStep(1)
        if (newProgress >= 50 && currentStep < 2) setCurrentStep(2)
        if (newProgress >= 75 && currentStep < 3) setCurrentStep(3)

        // 完成后跳转
        if (newProgress >= 100) {
          setTimeout(() => {
            router.push("/reports/review/report1")
          }, 1000)
        }

        return newProgress
      })

      setTimeRemaining((prev) => Math.max(prev - 1, 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [currentStep, router])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}分${secs.toString().padStart(2, "0")}秒`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-center">正在生成报告...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 进度动画 */}
          <div className="flex justify-center">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium">{progress}%</span>
              </div>
            </div>
          </div>

          {/* 步骤列表 */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <StepItem
                key={index}
                completed={index < currentStep}
                active={index === currentStep}
                pending={index > currentStep}
                title={step}
              />
            ))}
          </div>

          {/* 预计时间 */}
          <div className="text-center text-sm text-gray-500">预计剩余时间：{formatTime(timeRemaining)}</div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => router.push("/reports")}>
              在后台继续
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
