"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, CheckCircle, Circle, Bell, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// 进度项组件
function ProgressItem({
  completed,
  active,
  pending,
  label,
}: {
  completed?: boolean
  active?: boolean
  pending?: boolean
  label: string
}) {
  return (
    <div className="flex items-center gap-3">
      {completed && <CheckCircle className="h-4 w-4 text-green-500" />}
      {active && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
      {pending && <Circle className="h-4 w-4 text-gray-300" />}
      <span
        className={cn("text-sm", completed && "text-gray-700", active && "text-blue-600", pending && "text-gray-400")}
      >
        {label}
      </span>
    </div>
  )
}

export default function OptimizingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(7200) // 2小时 = 7200秒

  const steps = ["建设必要性 - 已优化", "投资估算 - 处理中", "实施进度 - 待处理", "风险分析 - 待处理"]

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(prev - 1, 0))

      // 模拟进度更新
      if (Math.random() < 0.1) {
        // 10% 概率更新步骤
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [steps.length])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${hours}小时${mins.toString().padStart(2, "0")}分钟`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>报告优化中</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 报告信息 */}
            <div className="flex items-center gap-3">
              <FileText className="h-12 w-12 text-gray-400" />
              <div>
                <h3 className="font-medium">九江市数字经济工程可研报告</h3>
                <p className="text-sm text-gray-500">提交时间：2025-06-20 14:30</p>
              </div>
            </div>

            {/* 状态信息 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">专家优化中</span>
              </div>
              <p className="text-sm text-blue-700">
                预计完成时间：{new Date(Date.now() + timeRemaining * 1000).toLocaleString()}
              </p>
              <p className="text-sm text-blue-700">剩余时间：{formatTime(timeRemaining)}</p>
            </div>

            {/* 批注处理进度 */}
            <div>
              <h4 className="text-sm font-medium mb-3">批注处理进度：</h4>
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <ProgressItem
                    key={index}
                    completed={index < currentStep}
                    active={index === currentStep}
                    pending={index > currentStep}
                    label={step}
                  />
                ))}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push("/reports")}>
                返回列表
              </Button>
              <Button variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                接收通知
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
