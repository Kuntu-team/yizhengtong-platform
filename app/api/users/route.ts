import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// 获取所有用户
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        created_time: true,
        updated_time: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.log("获取用户列表错误:", error);
    return NextResponse.json({ message: "服务器内部错误" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// 创建新用户
// export async function POST(request: NextRequest) {
//   try {
//     const { username, password,  role } = await request.json();

//     // 验证输入
//     if (!username || !password) {
//       return NextResponse.json(
//         { message: "用户名和密码不能为空" },
//         { status: 400 }
//       );
//     }

//     // 检查用户名是否已存在
//     const existingUser = await prisma.user.findUnique({
//       where: { username },
//     });

//     if (existingUser) {
//       return NextResponse.json({ message: "用户名已存在" }, { status: 400 });
//     }

//     // 加密密码
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 创建用户
//     const newUser = await prisma.user.create({
//       data: {
//         username,
//         password: hashedPassword,
//         role: role || "user",
//       },
//       select: {
//         id: true,
//         username: true,
//         role: true,
//         created_time: true,
//       },
//     });

//     return NextResponse.json(
//       {
//         message: "用户创建成功",
//         user: newUser,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.log("创建用户错误:", error);
//     return NextResponse.json({ message: "服务器内部错误" }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }
