"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, Eye, EyeOff, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

interface PasswordStrength {
  level: string
  color: string
  strength: number
  checks: {
    length: boolean
    lowercase: boolean
    uppercase: boolean
    numbers: boolean
    special: boolean
  }
}

const calculatePasswordStrength = (password: string): PasswordStrength => {
  let strength = 0
  const checks = {
    length: password.length >= 8 && password.length <= 20,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  Object.values(checks).forEach((check) => {
    if (check) strength++
  })

  let level = "弱"
  let color = "red"
  if (strength >= 4) {
    level = "强"
    color = "green"
  } else if (strength >= 3) {
    level = "中"
    color = "yellow"
  }

  return { level, color, strength, checks }
}

const PasswordInput = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  showPassword,
  onTogglePassword,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  showPassword: boolean
  onTogglePassword: () => void
}) => {
  return (
    <div className="mb-4">
      <Label className="text-gray-700 text-sm font-medium mb-2 block">{label}</Label>
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 pr-12 ${
            error ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
          }`}
        />
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  if (!password) return null

  const { level, color, strength } = calculatePasswordStrength(password)

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">密码强度：</span>
        <div className="flex gap-1 flex-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded ${
                i <= strength
                  ? color === "green"
                    ? "bg-green-500"
                    : color === "yellow"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <span
          className={`text-sm font-medium ${
            color === "green" ? "text-green-500" : color === "yellow" ? "text-yellow-500" : "text-red-500"
          }`}
        >
          {level}
        </span>
      </div>
    </div>
  )
}

const PasswordRules = ({ password }: { password: string }) => {
  if (!password) return null

  const { checks } = calculatePasswordStrength(password)

  const rules = [
    { key: "length", text: "8-20位字符", required: true },
    { key: "uppercase", text: "包含大写字母", required: true },
    { key: "lowercase", text: "包含小写字母", required: true },
    { key: "numbers", text: "包含数字", required: true },
    { key: "special", text: "包含特殊字符(推荐)", required: false },
  ]

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <p className="text-sm font-medium text-gray-700 mb-2">密码要求：</p>
      {rules.map((rule) => (
        <div key={rule.key} className="flex items-center gap-2 text-sm py-1">
          {checks[rule.key as keyof typeof checks] ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
          )}
          <span className={checks[rule.key as keyof typeof checks] ? "text-gray-700" : "text-gray-500"}>
            {rule.text}
          </span>
        </div>
      ))}
    </div>
  )
}

const SuccessModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 max-w-sm mx-4"
      >
        <div className="text-center">
          <div className="text-green-500 text-5xl mb-4">✅</div>
          <h3 className="text-lg font-semibold mb-2">密码修改成功！</h3>
          <p className="text-gray-600 mb-4">为了账户安全，请重新登录</p>
          <Button
            onClick={onClose}
            className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
          >
            重新登录
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [lockTime, setLockTime] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  // 倒计时
  useEffect(() => {
    if (lockTime > 0) {
      const timer = setInterval(() => {
        setLockTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setAttemptCount(0)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [lockTime])

  // 验证逻辑
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.oldPassword) {
      newErrors.oldPassword = "请输入原密码"
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "请输入新密码"
    } else if (formData.newPassword === formData.oldPassword) {
      newErrors.newPassword = "新密码不能与原密码相同"
    } else {
      const { checks } = calculatePasswordStrength(formData.newPassword)
      if (!checks.length || !checks.uppercase || !checks.lowercase || !checks.numbers) {
        newErrors.newPassword = "密码不符合安全要求"
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "请再次输入新密码"
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "两次输入的密码不一致"
    }

    return newErrors
  }

  // 提交处理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (lockTime > 0) {
      toast({
        title: "操作受限",
        description: `请等待${Math.floor(lockTime / 60)}:${(lockTime % 60).toString().padStart(2, "0")}后再试`,
        variant: "destructive",
      })
      return
    }

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})

    // 模拟API调用
    setTimeout(() => {
      // 模拟原密码验证
      if (formData.oldPassword !== "oldpass123") {
        setErrors({ oldPassword: "原密码错误" })
        setAttemptCount((prev) => {
          const newCount = prev + 1
          if (newCount >= 3) {
            setLockTime(300) // 5分钟
            toast({
              title: "账户已锁定",
              description: "连续3次密码错误，账户已锁定5分钟",
              variant: "destructive",
            })
          }
          return newCount
        })
      } else {
        // 成功
        setShowSuccess(true)
      }

      setLoading(false)
    }, 1000)
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)
    router.push("/login")
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <div className="bg-white border-b">
        <div className="flex items-center p-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="mr-4 p-2 rounded-lg hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-lg font-semibold">修改密码</h1>
        </div>
      </div>

      {/* 表单内容 */}
      <div className="p-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              <PasswordInput
                label="原密码"
                placeholder="请输入原密码"
                value={formData.oldPassword}
                onChange={(e) => {
                  setFormData({ ...formData, oldPassword: e.target.value })
                  if (errors.oldPassword) {
                    setErrors({ ...errors, oldPassword: "" })
                  }
                }}
                error={errors.oldPassword}
                showPassword={showPassword.old}
                onTogglePassword={() => setShowPassword({ ...showPassword, old: !showPassword.old })}
              />

              <PasswordInput
                label="新密码"
                placeholder="请输入新密码"
                value={formData.newPassword}
                onChange={(e) => {
                  setFormData({ ...formData, newPassword: e.target.value })
                  if (errors.newPassword) {
                    setErrors({ ...errors, newPassword: "" })
                  }
                }}
                error={errors.newPassword}
                showPassword={showPassword.new}
                onTogglePassword={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
              />

              <PasswordStrengthIndicator password={formData.newPassword} />

              <PasswordInput
                label="确认新密码"
                placeholder="请再次输入新密码"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value })
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: "" })
                  }
                }}
                error={errors.confirmPassword}
                showPassword={showPassword.confirm}
                onTogglePassword={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
              />

              <PasswordRules password={formData.newPassword} />

              <Button
                type="submit"
                disabled={loading || lockTime > 0}
                className="w-full mt-6 py-3 bg-blue-500 text-white rounded-lg font-medium
                  disabled:bg-gray-300 disabled:cursor-not-allowed
                  hover:bg-blue-600 transition-colors"
              >
                {lockTime > 0
                  ? `请等待 ${Math.floor(lockTime / 60)}:${(lockTime % 60).toString().padStart(2, "0")}`
                  : loading
                    ? "验证中..."
                    : "确认修改"}
              </Button>

              <div className="text-center mt-4">
                <p className="text-gray-500 text-sm">忘记密码，请联系管理员</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* 成功弹窗 */}
      {showSuccess && <SuccessModal onClose={handleSuccessClose} />}
    </div>
  )
}
