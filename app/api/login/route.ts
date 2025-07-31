import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

// JWT密钥 - 在生产环境中应该使用环境变量
const JWT_SECRET = process.env.JWT_SECRET || "yizhengtong_dev_secret";

// 简单的内存缓存，用于存储已验证的用户信息
const userCache = new Map<string, any>();

// 添加性能监控
let requestCount = 0;
let errorCount = 0;
let cacheHitCount = 0;
const performanceStats = {
  avgResponseTime: 0,
  totalRequests: 0,
  totalResponseTime: 0
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  requestCount++;
  
  try {
    const { phone_number, password } = await request.json();
    
    // 验证输入
    if (!phone_number || !password) {
      errorCount++;
      return NextResponse.json(
        { message: "手机号或密码不能为空" },
        { status: 400 }
      );
    }

    // 检查缓存中是否有用户信息
    const cacheKey = `${phone_number}:${password}`;
    let user = userCache.get(cacheKey);
    
    if (!user) {
      // 从数据库查询用户 - 只选择必要的字段以提高性能
      user = await prisma.business_person_base_info.findUnique({
        where: { phone_number: phone_number },
        select: {
          business_person_id: true,
          business_person_name: true,
          business_person_type: true,
          staff_id: true,
          position: true,
          phone_number: true,
          email: true,
          position_status: true,
          department: true,
          manager_name: true,
          password: true,
        },
      });

      if (!user || !user.password) {
        errorCount++;
        return NextResponse.json(
          { message: "手机号或密码错误" },
          { status: 401 }
        );
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        errorCount++;
        return NextResponse.json(
          { message: "手机号或密码错误" },
          { status: 401 }
        );
      }

      // 缓存用户信息（仅缓存5分钟）
      if (userCache.size < 1000) { // 限制缓存大小
        userCache.set(cacheKey, user);
        setTimeout(() => userCache.delete(cacheKey), 5 * 60 * 1000);
      }
    } else {
      cacheHitCount++;
    }

    // 生成JWT token
    const token = jwt.sign(
      {
        business_person_id: user.business_person_id,
        business_person_name: user.business_person_name,
        business_person_type: user.business_person_type,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const responseTime = Date.now() - startTime;
    
    // 更新性能统计
    performanceStats.totalRequests++;
    performanceStats.totalResponseTime += responseTime;
    performanceStats.avgResponseTime = performanceStats.totalResponseTime / performanceStats.totalRequests;

    // 返回成功响应
    return NextResponse.json({
      message: "登录成功",
      user: {
        business_person_id: user.business_person_id,
        business_person_name: user.business_person_name,
        business_person_type: user.business_person_type,
        staff_id: user.staff_id,
        position: user.position,
        phone_number: user.phone_number,
        email: user.email,
        position_status: user.position_status,
        department: user.department,
        manager_name: user.manager_name,
      },
      token,
      responseTime: `${responseTime}ms`,
      cached: !!userCache.get(cacheKey),
      requestCount,
      errorCount,
      cacheHitCount,
      cacheHitRate: `${((cacheHitCount / requestCount) * 100).toFixed(2)}%`,
      avgResponseTime: `${performanceStats.avgResponseTime.toFixed(2)}ms`
    });
  } catch (error) {
    errorCount++;
    console.log("登录错误:", error);
    return NextResponse.json({ 
      message: "服务器内部错误",
      requestCount,
      errorCount,
      cacheHitCount,
      cacheHitRate: `${((cacheHitCount / requestCount) * 100).toFixed(2)}%`
    }, { status: 500 });
  }
  // 移除 finally 块中的 disconnect，让连接池管理连接
}
