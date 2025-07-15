import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const {
      business_person_id,
      followed_person_id,
      department_code,
      follow_time,
    } = await request.json();

    if (!business_person_id || !followed_person_id || !department_code) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    // 检查是否已经关注
    const existingFollow = await prisma.wby_business_person_follow.findFirst({
      where: {
        business_person_id,
        followed_person_id,
      },
    });

    if (existingFollow) {
      // 如果已存在，更新is_active为true和关注时间
      const result = await prisma.wby_business_person_follow.updateMany({
        where: {
          business_person_id,
          followed_person_id,
        },
        data: {
          is_active: true,
          follow_time: follow_time ? new Date(follow_time) : new Date(),
          department_code,
        },
      });
      return NextResponse.json({
        ...existingFollow,
        is_active: true,
        follow_time: follow_time ? new Date(follow_time) : new Date(),
      });
    }

    // 如果不存在，创建新记录
    const result = await prisma.wby_business_person_follow.create({
      data: {
        business_person_id,
        followed_person_id,
        department_code,
        is_active: true,
        follow_time: follow_time ? new Date(follow_time) : new Date(),
        // 其他自定义字段可以在这里添加，如创建者ID等
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("创建关注记录失败:", error);
    return NextResponse.json({ error: "创建关注记录失败" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { business_person_id, followed_person_id } = await request.json();

    if (!business_person_id || !followed_person_id) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    const result = await prisma.wby_business_person_follow.updateMany({
      where: {
        business_person_id,
        followed_person_id,
      },
      data: {
        is_active: false,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "未找到关注记录" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("取消关注失败:", error);
    return NextResponse.json({ error: "取消关注失败" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie");
    const cookieObject = Object.fromEntries(
      (cookies || "")
        .split(";")
        .map((cookie) => cookie.trim())
        .filter(Boolean)
        .map((cookie) => {
          const [key, ...rest] = cookie.split("=");
          return [key, rest.join("=")];
        })
    );
    const businessPersonId = cookieObject["business_person_id"] || "";
    console.log("GET /api/business-person/follow called");
    // 从查询参数获取用户ID，如果不存在则使用当前登录用户ID
    // const businessPersonId = request.nextUrl.searchParams.get('businessPersonId') || 'e7558fb6-234c-475d-82b9-79db46840389';
    console.log("Using businessPersonId for query:", businessPersonId);
    console.log("Received businessPersonId:", businessPersonId);

    if (!businessPersonId) {
      console.log("Missing businessPersonId parameter");
      return NextResponse.json(
        { error: "Missing businessPersonId parameter" },
        { status: 400 }
      );
    }

    // 查询关注的人员ID
    const followedPersons = await prisma.wby_business_person_follow.findMany({
      where: {
        business_person_id: businessPersonId,
        is_active: true,
      },
      select: {
        followed_person_id: true,
      },
    });
    // console.log('Fetched followedPersons count:', followedPersons.length);
    // console.log('Fetched followed_person_ids:', followedPersons.map(item => item.followed_person_id));

    // 提取并返回followed_person_id数组
    const followedPersonIds = followedPersons.map(
      (item) => item.followed_person_id
    );
    // console.log('Returning followedPersonIds:', followedPersonIds);

    return NextResponse.json({
      followedPersonIds,
    });
  } catch (error) {
    console.error("Error fetching followed persons - Type:", typeof error);
    console.error(
      "Error fetching followed persons - Message:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "Error fetching followed persons - Stack:",
      error instanceof Error ? error.stack : undefined
    );
    return NextResponse.json(
      {
        error: "Failed to fetch followed persons",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}
