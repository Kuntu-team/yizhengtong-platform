import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

// JWT密钥 - 在生产环境中应该使用环境变量
const JWT_SECRET = process.env.JWT_SECRET || "yizhengtong_dev_secret";

export async function POST(request: NextRequest) {
  try {
    const { phone_number, password } = await request.json();
    // 验证输入
    if (!phone_number || !password) {
      return NextResponse.json(
        { message: "手机号或密码不能为空" },
        { status: 400 }
      );
    }

    const user = await prisma.business_person_base_info.findUnique({
      where: { phone_number: phone_number },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { message: "手机号或密码错误" },
        { status: 401 }
      );
    }
    // 检查用户是否激活
    // if (!user.is_active) {
    //   return NextResponse.json({ message: "账户已被禁用" }, { status: 401 });
    // }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    // const hash = await bcrypt.hash("Qc>WBmVVTW5G]4n", 10);
    // console.log(hash);
    // $2b$10$uTd8ZPyKOBSbVqMhqJio3eHAkcWDpCVGNOiQ3ALWTc2ZL/XZMkFha
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "手机号或密码错误" },
        { status: 401 }
      );
    }

    // 更新最后登录时间
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: { last_login: new Date() },
    // });

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
    });
  } catch (error) {
    console.log("登录错误:", error);
    return NextResponse.json({ message: "服务器内部错误" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
