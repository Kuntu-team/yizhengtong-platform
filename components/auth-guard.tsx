"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    console.log("AuthGuard 检查路径:", pathname) // 调试用

    // 直接设置为已登录状态，注释掉登录检查
    // const publicPaths = ["/login"]
    // if (publicPaths.includes(pathname)) {
    //   console.log("公开页面，无需认证")
    //   setLoading(false)
    //   setAuthenticated(true)
    //   return
    // }

    // 直接创建默认的商务领导用户
    const businessLeader = {
      id: "1",
      name: "王总监",
      phone: "13800138000",
      role: "商务总监",
      employeeId: "BUS001",
      team: "商务拓展部",
      manager: "张总经理",
      regions: ["华东区", "华南区"],
      lastLoginTime: Date.now() - 300000,
      lastLoginLocation: "上海市",
    }

    localStorage.setItem("userInfo", JSON.stringify(businessLeader))
    localStorage.setItem("token", "mock-jwt-token-12345")
    console.log("创建默认商务领导用户信息")

    // 模拟验证token有效性
    setTimeout(() => {
      console.log("认证成功")
      setAuthenticated(true)
      setLoading(false)
    }, 100) // 减少延迟时间
  }, [pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  return authenticated ? <>{children}</> : null
}
