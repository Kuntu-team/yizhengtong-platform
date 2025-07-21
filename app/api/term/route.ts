import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function GET(request: Request) {
  try {
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

    const targetBusinessPersonId = cookieObject["business_person_id"] || "";

    const regionInfos = await prisma.business_manager_region_info.findMany({
      where: {
        business_person_id: targetBusinessPersonId,
      },
    });
    const regionCodes = regionInfos.map((r: any) => r.region_code);

    // 2. 查询并过滤 news
    const newsRaw = await prisma.position_adjustment_notice.findMany();
    const news = newsRaw
      .map((item) => ({
        news_id: item.notice_id,
        news_province_code: item.province_code,
        news_region_code: item.region_code,
        news_source: item.issued_authority,
        news_time: item.released_date,
        news_title: item.notice_title,
        news_content: item.notice_content,
        news_url: item.notice_url,
        created_time: item.created_time,
        updated_time: item.updated_time,
        data_status: item.data_status,
        news_city_cn: item.city_cn,
        news_city_code: item.city_code,
        news_district_cn: item.district_cn,
        news_district_code: item.district_code,
        news_province_cn: item.province_cn,
      }))
      .filter((item) => regionCodes.includes(item.news_region_code));

    return NextResponse.json(news);
  } catch (error) {
    console.log("Error fetching sales leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales leads" },
      { status: 500 }
    );
  }
}
