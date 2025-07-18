import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const cookies = request.headers.get("cookie");

  // 解析 cookie 字符串为对象
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

  const user_id = cookieObject["business_person_id"] || "";
  try {
    const { news_ids } = await request.json();

    // 批量 upsert
    await Promise.all(
      news_ids.map((news_id: string) =>
        prisma.user_notification_read.upsert({
          where: { user_id_news_id: { user_id, news_id } },
          update: { read_time: new Date() },
          create: { user_id, news_id, read_time: new Date() },
        })
      )
    );

    return Response.json({ success: true });
  } catch (error) {
    console.log("Error fetching department positions:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
