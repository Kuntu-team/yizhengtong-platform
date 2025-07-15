import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  // 先写死 business_person_id，后续可从 req.query 获取
  const cookies = req.headers.get("cookie");
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
  // const businessPersonId = 'e7558fb6-234c-475d-82b9-79db46840389';
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const offset = (page - 1) * pageSize;

  // 查询当前商务负责人关注的所有领导 person_id
  const followed = await prisma.wby_business_person_follow.findMany({
    where: {
      business_person_id: businessPersonId,
      is_active: true,
    },
    select: {
      followed_person_id: true,
    },
  });
  const followedPersonIds = followed.map((f) => f.followed_person_id);

  // 计算近1个月的起始时间
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // 查询新闻总数
  const total = await prisma.key_person_news.count({
    where: {
      person_id: { in: followedPersonIds },
      data_status: "1",
      news_time: { gte: oneMonthAgo },
    },
  });

  // 查询新闻数据
  const news = await prisma.key_person_news.findMany({
    where: {
      person_id: { in: followedPersonIds },
      data_status: "1",
      news_time: { gte: oneMonthAgo },
    },
    orderBy: { news_time: "desc" },
    skip: offset,
    take: pageSize,
  });

  // 查询标签
  const newsIds = news.map((n) => n.news_id);
  const tags = await prisma.key_person_news_tags.findMany({
    where: { news_id: { in: newsIds } },
  });
  const tagsMap = Object.fromEntries(tags.map((t) => [t.news_id, t.tags]));

  // 查询领导姓名
  const personIds = Array.from(
    new Set(
      news.map((n) => n.person_id).filter((id): id is string => Boolean(id))
    )
  );
  const leaders = await prisma.key_person_base_info.findMany({
    where: { person_id: { in: personIds } },
    select: { person_id: true, person_name: true },
  });
  const leaderMap = Object.fromEntries(
    leaders.map((l) => [l.person_id, l.person_name])
  );

  // 整理返回数据
  const result = news.map((n) => ({
    id: n.news_id,
    title: n.news_title,
    summary: n.news_content,
    time: n.news_time,
    leader: leaderMap[n.person_id || ""] || "",
    tags: tagsMap[n.news_id] || "",
    source: n.news_source,
    region: n.news_region_cn,
    category: n.news_region_level,
  }));

  return NextResponse.json({
    total,
    page,
    pageSize,
    data: result,
  });
}
