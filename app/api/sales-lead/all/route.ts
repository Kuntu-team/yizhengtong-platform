import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // 解析 URL 参数
    const { searchParams } = new URL(request.url);
    const personId = searchParams.get("person_id");
    const personIds = searchParams.get("person_ids");
    const timeLimit = searchParams.get("time_limit");

    // 构建查询条件
    let whereClause: any = {};

    // 处理单个 person_id
    if (personId) {
      whereClause = { person_id: personId };
    }
    // 处理多个 person_ids（逗号分隔）
    else if (personIds) {
      const ids = personIds
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id);
      if (ids.length > 0) {
        whereClause = { person_id: { in: ids } };
      }
    } else if (timeLimit) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - 15);
      whereClause.news_time = {
        gte: daysAgo, // gte 表示 greater than or equal (大于等于)
      };
    }

    const news = await prisma.key_person_news.findMany({
      where: whereClause,
    });

    const [persons, private_info, tags] = await Promise.all([
      prisma.key_person_base_info.findMany(),
      prisma.key_person_private_info.findMany(),
      prisma.key_person_news_tags.findMany(),
    ]);

    const result = news.map((item) => {
      const person = persons.find((p) => p.person_id === item.person_id);
      const person_private = private_info.find(
        (p) => p.person_id === item.person_id
      );
      const newTag = tags.find((t) => t.news_id === item.news_id);
      let filter_code = null;
      if (item.news_region_level === "1") {
        filter_code = item.news_province_code;
      } else if (item.news_region_level === "2") {
        filter_code = item.news_city_code;
      } else if (item.news_region_level === "3") {
        filter_code = item.news_district_code;
      }

      return {
        ...item,
        person_name: person?.person_name || null,
        tags_name: newTag?.tags || null,
        person_private: person_private || {
          person_id: item.person_id,
          phone_number: "未知",
          wechat_number: "未知",
        },
        position:
          (person?.region_cn ?? "") +
          (person?.department ?? "") +
          (person?.position ?? ""),
        filter_code: filter_code,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.log("Error fetching sales leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales leads" },
      { status: 500 }
    );
  }
}
