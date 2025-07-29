import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // 获取筛选参数
    const regionsParam = searchParams.get("regions");
    const peopleParam = searchParams.get("people");
    const personIdParam = searchParams.get("person_id");
    const personIdsParam = searchParams.get("person_ids");

    const regions = regionsParam ? regionsParam.split(",") : [];
    const people = peopleParam ? peopleParam.split(",") : [];
    const personIds = personIdsParam ? personIdsParam.split(",") : [];

    // 构建筛选条件
    const whereConditions: any = {};

    // 如果有地区筛选条件
    if (regions.length > 0) {
      whereConditions.OR = [
        { news_province_code: { in: regions } },
        { news_city_code: { in: regions } },
        { news_district_code: { in: regions } },
      ];
    }

    // 如果有人物筛选条件（优先级：person_id > person_ids > people）
    if (personIdParam) {
      whereConditions.person_id = personIdParam;
    } else if (personIds.length > 0) {
      whereConditions.person_id = { in: personIds };
    } else if (people.length > 0) {
      whereConditions.person_id = { in: people };
    }

    // 查询总数（应用筛选条件）
    const total = await prisma.key_person_news.count({
      where: whereConditions,
    });

    // 分页查询（应用筛选条件）
    const news = await prisma.key_person_news.findMany({
      where: whereConditions,
      skip,
      take,
      orderBy: {
        news_time: "desc",
      },
    });

    const persons = await prisma.key_person_base_info.findMany();
    const tags = await prisma.key_person_news_tags.findMany();
    const private_info = await prisma.key_person_private_info.findMany();
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
        person_private: person_private,
        position:
          (person?.region_cn ?? "") +
          (person?.department ?? "") +
          (person?.position ?? ""),
        filter_code: filter_code,
      };
    });

    return NextResponse.json({
      data: result,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.log("Error fetching sales leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales leads" },
      { status: 500 }
    );
  }
}
