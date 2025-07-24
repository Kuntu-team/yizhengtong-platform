import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const token = process.env.DIFY_TOKEN;
  // 获取请求体
  const body = await req.text();

  // 请求第三方流式接口
  //   const response = await fetch("https://dify.ktt.team/v1/chat-messages", {
  const response = await fetch("https://dify.ktt.team/v1/chat-messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
  });

  // 直接返回流式响应
  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") || "application/octet-stream",
    },
  });
}
